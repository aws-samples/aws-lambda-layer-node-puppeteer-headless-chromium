/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
*/

const AWS = require("aws-sdk");
const response = require("cfn-response");
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = function (event, context) {
  console.log(JSON.stringify(event));
  try {
    if (event.RequestType == "Delete") {
      //Ignore Deletes
      response.send(event, context, "SUCCESS", {});
    }
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      console.log(event.RequestType + " upserting item in DDB ");
      console.log(JSON.stringify(event, null, 2));
      var item = event.ResourceProperties.Item.replace("\n", "");
      console.log(item);
      var params = {
        TableName: event.ResourceProperties.TableName,
        Item: JSON.parse(event.ResourceProperties.Item.replace("\n", "")),
      };
      docClient.put(params, function (err, data) {
        if (err) {
          console.log(err);
          response.send(event, context, "FAILED", {});
        } else {
          response.send(event, context, "SUCCESS", {});
        }
      });
    }
  } catch (e) {
    console.log(e);
    response.send(event, context, "FAILED", {});
  }
};
