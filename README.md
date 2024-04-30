# PhishDefender

PhishDefender is a Node.js script that scans your Gmail inbox for potential phishing emails based on specific criteria and sends notifications if suspicious emails are detected.

## Features

- Email Retrieval: Retrieve emails from your Gmail inbox using the Gmail API.
- Phishing Detection: Analyze retrieved emails to detect potential phishing attempts based on predefined keywords.
- Notification: Send email notifications to alert the user if suspicious emails are found.

## Prerequisites

Before running this script, make sure you have the following prerequisites installed and set up:

- Node.js: Ensure you have Node.js installed on your system.
- Gmail API Credentials: Obtain OAuth 2.0 credentials from the Google Cloud Console to authenticate with the Gmail API.

## Configuration 

Set up the required environment variables for authentication with the Gmail API:

 - CLIENT_ID: Your Google Cloud Console client ID.
 - CLIENT_SECRET: Your Google Cloud Console client secret.
 - REFRESH_TOKEN: Your Gmail API refresh token.
 - ACCESS_TOKEN: Your Gmail API access token.

## Credit 

This project was created with the help of many sources:


-	ChatGPT
-	YouTube Account of Mafia Codes 
    https://youtu.be/-rcRf7yswfM?si=i4dVvyp6cBF4BLG1
-	GitHub Docs
  	https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
    https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsecretsinherit
-	Fellow peers 


