# A CloudFormation Custom Resource to add an item to a DynamoDB table (CFNDDBAddItem)

## Purpose

This project contains an AWS CloudFormation custom resource to add an item to a DynamoDB Table
and a Python script that exports items from a source DDB table into a CloudFormation template
that references the custom resource.

## Requirements

- The [AWS CLI](https://www.python.org/downloads/)
- The [AWS Serverless Application Model](https://docs.aws.amazon.com/serverless-application-model/index.html) must be [installed](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Python 3.7](https://www.python.org/downloads/)
- [Node 12.x](https://nodejs.org/en/download/)

## CFNDDAddItem Custom Resource

### Deploying CFNDDBAddItem

From the command line, run:

```bash
sam build
sam deploy  --stack-name cfn-dynamodb-add-item  --capabilities "CAPABILITY_NAMED_IAM" --resolve-s3
```

This will deploy an AWS Lambda custom resource that can be called by your CloudFormation template.

### Using the custom resource

```yaml
  AddItemToDDB:
    Type: Custom::CFNDDBAddItem
    Properties:
      ServiceToken: !ImportValue CFNDDBAddItem
      TableName: ExampleTable
      Item: >
        {
            "year" : 2013,
            "title" : "Turn It Down, Or Else!",
            "info" : {
                "directors" : [
                    "Alice Smith",
                    "Bob Jones"
                ],
                "release_date" : "2013-01-18T00:00:00Z",
                "rating" : 6.2,
                "genres" : [
                    "Comedy",
                    "Drama"
                ],
                "image_url" : "http://ia.media-imdb.com/images/N/O9ERWAU7FS797AJ7LU8HN09AMUP908RLlo5JF90EWR7LJKQ7@@._V1_SX400_.jpg",
                "plot" : "A rock band plays their music at high volumes, annoying the neighbors.",
                "rank" : 11,
                "running_time_secs" : 5215,
                "actors" : [
                    "David Matthewman",
                    "Ann Thomas",
                    "Jonathan G. Neff"
              ]
            }
        }
```

A sample template is included that creates a DynamoDB table and adds an item to it.  You can deploy the sample stack by running:

```bash
sam deploy  --template-file sample-cfn-ddb-add-item-template.yml --stack-name cfn-dynamodb-sample-stack  --capabilities "CAPABILITY_NAMED_IAM" --resolve-s3
```

## DynamoDB Exporter script

If you have items in a source DynamoDB table that you want to import into a separate DynamoDB table,
you can use the *create-dynamo-items-template* Python script.

### Usage

First create a config.json file in the dynamodb_exporter directory:

```json
{
    "TableName":"your source DynamoDB table",
    "Output":{
        "Filename": "output-template.json",
        "TableName":"destination DynamoDB table",
        "TemplateDescription":"A description of the stack that wlll be created."
    }
}
```

Then run the script:

```bash
cd dynamodb_exporter    
pip3 install -r requirements.txt #First time only
python3 ./dynamodb-exporter/create-dynamodb-items-template.py
```
