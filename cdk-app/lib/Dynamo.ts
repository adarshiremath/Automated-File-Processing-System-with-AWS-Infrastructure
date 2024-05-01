import * as cdk from 'aws-cdk-lib';
import { AttributeType, Table, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class Dynamo extends Table {
  constructor(scope: Construct) {
    super(scope, "UploadTable", {
      tableName: "FileTable",
      partitionKey: { name: "nanoId", type: AttributeType.STRING },
      stream:StreamViewType.NEW_IMAGE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}