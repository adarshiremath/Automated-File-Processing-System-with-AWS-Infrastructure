import React, { useState } from "react";
import AWS from "aws-sdk";
import axios from "axios";
import { nanoid } from "nanoid";

import "../styles/styles.css";
import { signOut } from "aws-amplify/auth";

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_SECRET_KEY,
  region: process.env.REACT_APP_REGION,
});

// S3 instance
const s3 = new AWS.S3();

const LandingPage = (props) => {
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState(null);

  //Handling form changes
  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleFileChange = (e) => {
    setFileInput(e.target.files[0]);
  };

  // Handling submit button
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Upload file to S3 IO Bucket
    const s3Params = {
      Bucket: process.env.REACT_APP_IO_BUCKET,
      Key: fileInput.name,
      Body: fileInput,
    };

    try {
      const data = await s3.upload(s3Params).promise();
      console.log("File uploaded successfully", data.Location);
    } catch (error) {
      console.error("Error uploading file to S3 IO:", error);
    }

    // handling API gatway point
    try {
      const id = nanoid();

      const dynamoDBData = {
        nanoId: id,
        inputText: textInput,
        s3Path: `s3://${s3Params.Bucket}/${s3Params.Key}`,
      };
      await axios.post(
        process.env.REACT_APP_API_GATEWAY_ENDPOINT + "upload",
        dynamoDBData,
        {
          headers: {
            Authorization: `Bearer ${props.accessToken}`,
          },
        }
      );
      // .promise();
      console.log("Data added to DynamoDB successfully");
    } catch (error) {
      console.error("Error inserting to DynamoDB:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Fovus File Upload</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label
            htmlFor="text_input"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Text Input
          </label>
          <input
            type="text"
            id="text_input"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required={true}
            value={textInput}
            onChange={handleTextChange}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="file_input"
            className="block mb-1 text-sm font-medium text-gray-700"
          >
            File Input
          </label>
          <input
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            id="file_input"
            type="file"
            onChange={handleFileChange}
          />
        </div>

        <button
          type="submit"
          className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        >
          Submit
        </button>
      </form>
      <button
        type="submit"
        onClick={signOut}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
      >
        SIgn out
      </button>
    </div>
  );
};

export default LandingPage;
