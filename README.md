# Use AWS Lambda and Puppeteer and aws-chrome-lambda to crawl web pages

## Purpose

A demonstration of how to use AWS Lambda, Puppeteer, and aws-chrome-lambda to crawl a web page periodically.

## Requirements

- The [AWS CLI](https://www.python.org/downloads/)
- The [AWS Serverless Application Model](https://docs.aws.amazon.com/serverless-application-model/index.html) must be [installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Python 3.7](https://www.python.org/downloads/)
- [Node 12.x](https://nodejs.org/en/download/)


## Deploying the Lambda

From the command line, run:

```bash
sam build --template-file cloudformation-template.yml  
sam deploy --template-file .aws-sam/build/template.yaml --stack-name lambda-crawler3 --resolve-s3 --capabilities "CAPABILITY_NAMED_IAM"
```
