"""
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
"""

`
from boto3.dynamodb.types import TypeDeserializer
from boto3.dynamodb.transform import TransformationInjector
import jsonschema
import simplejson as json 
import os
import boto3
import sys


with open(os.path.join(sys.path[0], 'config.json'), "r") as file:
    config = json.load(file)
    
template = {
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": config["Output"]["TemplateDescription"],
    "Resources": {}
}



client = boto3.client('dynamodb')
paginator = client.get_paginator('scan')
operation_model = client._service_model.operation_model('Scan')
trans = TransformationInjector(deserializer = TypeDeserializer())
operation_parameters = {
  'TableName': config["TableName"],  
}
items = []

for page in paginator.paginate(**operation_parameters):
    has_last_key = 'LastEvaluatedKey' in page
    if has_last_key:
        last_key = page['LastEvaluatedKey'].copy()
    trans.inject_attribute_value_output(page, operation_model)
    if has_last_key:
        page['LastEvaluatedKey'] = last_key
    items.extend(page['Items'])

itemNum = 0
for item in items:
    itemNum +=1
    resource_name = f"DBItem{itemNum}"

    template["Resources"].update(
    {resource_name: {
        "Type": "Custom::DynampDBItem",
        "Properties": {
                "ServiceToken": {
                    "Fn::ImportValue": "CFNDDBAddItem"
                },
            "TableName":config["Output"]["TableName"],
            "Item":json.dumps(item)      
        }
    }})

with open(os.path.join(sys.path[0], config["Output"]["Filename"]), 'w') as f:
    json.dump(template, f, indent=4, default=str)