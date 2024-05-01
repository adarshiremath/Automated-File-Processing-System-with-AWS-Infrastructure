import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { Bucket, CorsRule, HttpMethods } from 'aws-cdk-lib/aws-s3';

const corsRule: CorsRule = {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST],
    allowedHeaders: ['*'],
};


export class S3Bucket extends Bucket {
    constructor(scope: Construct, s3Name: string, bucketName: string) {
        super(scope, s3Name, {
            bucketName: bucketName,
            versioned: false,
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            cors: [corsRule]
        });
    } 

}
