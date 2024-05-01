const {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { Readable } = require("stream");
const fs = require("fs");

const nanoId = process.env.NANO_ID;

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const s3Client = new S3Client({ region: "us-east-2" });

async function getInputFromDynamoDB(nanoId) {
  const params = {
    TableName: "FileTable",
    Key: {
      nanoId: { S: nanoId },
    },
  };
  try {
    const { Item } = await ddbClient.send(new GetItemCommand(params));
    return Item;
  } catch (error) {
    console.error("Error getting item from DynamoDB:", error);
    throw error;
  }
}

async function downloadAndAppendInputAndUploadOutput(
  bucketName,
  inputFileKey,
  inputText
) {
  try {
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: "fovusfileuploadbucket",
        Key: "InputFile.txt",
      })
    );
    const str = await Body.transformToString();
    const textToWrite = str + " : " + inputText;

    console.log("Input file donloaded and input text appended successfully.");

    const params = {
      Bucket: "fovusfileuploadbucket",
      Key: "OutputFile.txt",
      Body: textToWrite,
    };
    const response = await s3Client.send(new PutObjectCommand(params));

    const s3Path = `s3://${params.Bucket}/${params.Key}`;
    console.log("response", s3Path);
    console.log("Output file is sent.");
    return s3Path;
  } catch (error) {
    console.error("Error downloading input file from S3:", error);
    throw error;
  }
}

async function AddToDynamoDB(nanoId, S3Path) {
  try {
    const updateParams = {
      TableName: "FileTable",
      Key: { nanoId: { S: nanoId } },
      UpdateExpression: "SET output_file_path = :val1",
      ExpressionAttributeValues: { ":val1": { S: S3Path } },
    };
    await ddbClient.send(new UpdateItemCommand(updateParams));
    console.log("DynamoDB updated with output file path.");
  } catch (error) {
    console.error("Error updating path to DynamoDB:", error);
    throw error;
  }
}

async function main() {
  try {
    const InputFileDetails = await getInputFromDynamoDB(nanoId);
    console.log(InputFileDetails.FilePath.S);

    const { BucketName, InputFile, InputText } = {
      BucketName: "fovusfileuploadbucket",
      InputFile: InputFileDetails.FilePath.S,
      InputText: InputFileDetails.InputText.S,
    };

    const OutputFiles3Path = await downloadAndAppendInputAndUploadOutput(
      BucketName,
      InputFile,
      InputText
    );

    await AddToDynamoDB(nanoId, OutputFiles3Path);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
main();
console.log("Test has passed");
