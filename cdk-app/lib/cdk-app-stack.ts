import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Policy, PolicyStatement, Effect, Role, ServicePrincipal, ManagedPolicy, InstanceProfile } from 'aws-cdk-lib/aws-iam';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

import { S3Bucket } from './S3Bucket';
import { ApiGateway } from './ApiGateway';
import { Dynamo } from './Dynamo';
import { Lambda } from './Lambda';


export class CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create InputFileUploadBucket
    const inputFileUploadBucket = new S3Bucket(this, 'InputFileUploadBucket', 'inoutfileuploadbucketforfovus');
     
    // Create ScriptFileBucket
    const scriptFileBucket = new S3Bucket(this, 'ScriptFileBucket', 'runscriptfilebucketforfovus');
    
    
    const deploy = new BucketDeployment(this, 'DeployFiles', {
      sources: [Source.asset(path.join(__dirname, './scriptfolder'))],
      destinationBucket: scriptFileBucket,
    });

    //Create Api Gateway
    const api = new ApiGateway(this);

    
     // Create Lambda Function
     const ApiDynamoFunction = new Lambda(this, "uploadFunction");
     
     const DynamoEC2Function = new Lambda(this, "ScriptFunction");
     
    // Define IAM policy granting full EC2 access
    const administratorPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['*'], // This grants all actions
      resources: ['*'] // This grants access to all resources
    });
    
    const Ec2adminRole = new Role(this, 'AdminRole', {
      roleName: 'Ec2adminRole',
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'), // Assuming EC2 service, change this if assuming a different service
    });

    // Attach AdministratorAccess policy
    Ec2adminRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    const instanceProfile = new InstanceProfile(this, 'Ec2AdminInstanceProfile', {
      instanceProfileName: 'Ec2adminRole-instance-profile',
      role: Ec2adminRole,
    });

    // Attach the administrator policy to your IAM role
    DynamoEC2Function.role?.attachInlinePolicy(new Policy(this, 'AdministratorAccessPolicy', {
      statements: [administratorPolicyStatement],
    }));
    

    // Define a DynamoDB table
    const table = new Dynamo(this);


    // Lambda trigger by DynamoDB
    DynamoEC2Function.addEventSource(new DynamoEventSource(table,{
      startingPosition: StartingPosition.LATEST,
      retryAttempts:2,
      batchSize:10
    }))
    
    // ApiGateway -> Lambda intigration
    api.addIntegration("POST", "/upload", ApiDynamoFunction);
    
  }
}
