// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const fs = require('fs')
const crawler = require("/opt/nodejs/lib/crawler")

exports.handler = async (event, context, callback) => {


  try {
    await crawler(process.env.URLS.split(","),(data) => {
      let filename = "/tmp/"+data.title+".html"
      console.log("Writing " + filename )
      fs.writeFileSync(filename,data.content)
    });
    return;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

