# Puppeteer/Node Headless Chromium Lambda Layer

This repository provides an AWS Lambda layer that can run Puppeteer in
a headless chromium browser, a utility library and a sample Lambda with a CloudFormation template.


## Prerequisites

- The [AWS CLI](https://www.python.org/downloads/)
- The [AWS Serverless Application Model](https://docs.aws.amazon.com/serverless-application-model/index.html) must be [installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Node 12.x](https://nodejs.org/en/download/)


## Building

To build the layer and the sample crawler run the following:

```bash
sam build --template-file cloudformation-template.yml  
sam deploy --template-file .aws-sam/build/template.yaml --stack-name lambda-crawler3 --resolve-s3 --capabilities "CAPABILITY_NAMED_IAM"
```

## Usage


### Using the included Crawler library

```javascript
const crawler = require("crawler")

exports.handler = async (event, context, callback) => {

  try {
    await crawler(process.env.URLS.split(","),(data) => {
        // <Your code here>
        
    });
    return;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
```
The ```crawler``` function takes two parameters:

- an array of URLs to crawl.  The pages can either be regular web pages or PDF files.
- a callback function with one parameter -- ```data```

```data``` will  contains five properties after the page is loaded:

- id - a hash value of the url. Use a short reference for the page
- url - the url of the page that was crawled
- title - the page title for HTML or the name of the PDF
- content - the content of the page
- page - the [Puppeteer page object](https://pptr.dev/#?product=Puppeteer&version=v10.1.0&show=api-class-page)


### CrawlPage sample Lambda

The CrawlPage sample Lambda simply crawls the pages specified by the ```URLS`` environment variable and saves the content to the local filesystem on a schedule using CloudWatch Events.

### Using the Puppeteer module directly

You can use Puppeteer directly by adding a require statement at the beginning of your code:

``` const puppeteer = require("puppeteer") ```

See the [official web site](https://developers.google.com/web/tools/puppeteer) for usage.



