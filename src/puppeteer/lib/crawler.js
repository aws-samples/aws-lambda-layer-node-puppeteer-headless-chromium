const chromium = require("chrome-aws-lambda");
const fs = require('fs')
const https = require("https");
const pdfreader = require("pdfreader");
const crypto = require("crypto");


async function getPage(url) {

  try {
      browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      page = await browser.newPage();
      await page.goto(url,{ waitUntil: 'networkidle0' });

    return page
  } catch (error) {
    console.log("Warning:" + error);
    console.log("Resetting browser context");
    try {
      page.Browser.close();
    } catch {}
  } finally {
    browser = null;
  }
}

async function getTextFromPDF(url) {
    var pdfBuffer = await bufferize(url);
    var pdfParagraphs = await readlines(pdfBuffer);
    console.log(JSON.stringify(pdfParagraphs));
    var allLines = pdfParagraphs.flat(5);
    return allLines.join("\n");
  }
  

async function bufferize(url) {
  var hn = url.substring(url.search("//") + 2);
  hn = hn.substring(0, hn.search("/"));
  var pt = url.substring(url.search("//") + 2);
  pt = pt.substring(pt.search("/"));
  const options = { hostname: hn, port: 443, path: pt, method: "GET" };
  return new Promise(function(resolve, reject) {
    var buff = new Buffer.alloc(0);
    const req = https.request(options, (res) => {
      res.on("data", (d) => {
        buff = Buffer.concat([buff, d]);
      });
      res.on("end", () => {
        resolve(buff);
      });
    });
    req.on("error", (e) => {
      console.error("https request error: " + e);
    });
    req.end();
  });
}

async function readlines(buffer, xwidth) {
  return new Promise((resolve, reject) => {
    var pdftxt = new Array();
    var pg = 0;
    new pdfreader.PdfReader().parseBuffer(buffer, function(err, item) {
      if (err) console.log("pdf reader error: " + err);
      else if (!item) {
        pdftxt.forEach(function(a, idx) {
          pdftxt[idx].forEach(function(v, i) {
            pdftxt[idx][i].splice(1, 2);
          });
        });
        resolve(pdftxt);
      } else if (item && item.page) {
        pg = item.page - 1;
        pdftxt[pg] = [];
      } else if (item.text) {
        var t = 0;
        var sp = "";
        pdftxt[pg].forEach(function(val, idx) {
          if (val[1] == item.y) {
            if (xwidth && item.x - val[2] > xwidth) {
              sp += " ";
            } else {
              sp = "";
            }
            pdftxt[pg][idx][0] += sp + item.text;
            t = 1;
          }
        });
        if (t == 0) {
          pdftxt[pg].push([item.text, item.y, item.x]);
        }
      }
    });
  });
}




module.exports = async function(urls,callback=undefined) {
  try {
    for (let url of urls) {
      let id = crypto.createHash("sha1").update(url).digest("base64")
      let title
      let page
      let content
      console.log("Retrieving " + url);
      if (
        url
          .split(".")
          .slice(-1)[0]
          .toLowerCase() != "pdf"
      ) {
        page = await getPage(url);
        if (page == null) {
          console.log("Warning: Could not scrape " + url + " skipping....");
          continue;
        }
        content = await page.content()
        title = await page.title()

      } else {
        console.log("Indexing PDF " + url);
        title = url.split("/").slice(-1)[0]
        content = await getTextFromPDF(url)
      }
      if(callback){
        callback({
          id:id,
          url:url,
          title:title,
          content: content,
          page: page
        })
      }
      if (page) {
        page.close();
        page = null;
      }
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const isLambda = !!process.env.LAMBDA_TASK_ROOT;
if(!isLambda){
  (async () => {
      urls = [
          "https://aws.amazon.com/kendra/faqs/",
          "https://aws.amazon.com/lex/faqs/",
          "https://aws.amazon.com/comprehend/faqs/"

      ]
      crawlPages(urls,(data) => fs.writeFileSync(data.title+".html",data.content) )
  })();
}