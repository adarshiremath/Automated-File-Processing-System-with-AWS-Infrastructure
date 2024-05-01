# Automated File Processing System with AWS Infrastructure

Git clone this repo. In which you should have cdk-app and front-app. First we will be creating the cdk stack for our cloud
and then implementing our front end app.

## Steps to setup CDK-APP
1. Have an AWS account, and create a user in the Identity and access management(IAM) with "AdministratorAccess" in the policy permissions. And create access key for this user which will be give you "Access Key" and a "Secret Access Key". (https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)
2. Making sure you have following requirements
 a. nodejs -> https://nodejs.org/en/download
 b. aws cli -> https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
   i. Make sure to setup the aws cli by running `aws configure` command 
   ii. It will prompt for Access Key, Secret Access key and region. Use the keys that we retrieved earlier and for the region you will find it at the top-right corner of your aws management console.
 c. aws-cdk -> `npm install -g aws-cdk`
3. run `cdk bootstrap`, which basically prepares the environment for our deployment.
4. run `npm i -D esbuild`
5. run `cdk deploy`, when it asked if do you want to continue press `y` and press Enter
6. The cloud resource should be ready once the command is executed.
7. once the execution is completed, in our console we get an output as below
`CdkAppStack.ApiGatewayEndpoint5AA8EC3A = https://**********.execute-api.us-east-1.amazonaws.com/prod/`
make sure to have the endpoint handing for the react-app


Now we can switch over to the react front end app


## Steps to setup REACT-APP
1. Here we would need to setup the .env file
 a. In the .ENV file set the REACT_APP_ACCESS_KEY to your access key retireved earlier and same with REACT_APP_SECRET_KEY and the REACT_APP_REGION to the region.
 b. You would also need to set the REACT_APP_API_GATEWAY_ENDPOINT to the api gateway that we get after our cdk deploy command is executed, which has been indicated earlier.
2. Once the above is done. run the below commands to setup the cognito authentication
 a. run `amplify import auth`
  i. In this select the option of `Cognito user pool only`
 b. run `amplify push`
3. run `npm start`
4. The Website will pop up or click on the link that is shown once you run serve command
5. In the react website, it will ask to sign in or sign up. For the first time You would have to sign up. Subsequently you will be able to sign in.
6. Once signed in you will get to input text and input file. do as required.
7. Finally after sometime, once the backend process is finished, The output file will be available inside the inoutfileuploadbucketforfovus s3 bucket that we have created.(Give it couple of minutes)

==========================================
Thank You! 
