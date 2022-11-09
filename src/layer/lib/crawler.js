// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const chromium = require("chrome-aws-lambda");
const fs = require('fs')
const https = require("https");
const crypto = require("crypto");


async function getPage(url) {

  try {
      let browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });
      let page = await browser.newPage();
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

        console.log("PDF crawling is no longer supported")
        continue;
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
