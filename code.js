const nodemailer = require('nodemailer');
const { google } = require('googleapis');

async function main() {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const redirectUri = 'https://developers.google.com/oauthplayground';

    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
    oAuth2Client.setCredentials({ access_token: ACCESS_TOKEN, refresh_token: REFRESH_TOKEN });

    const gmail = google.gmail({
        version: 'v1',
	@@ -28,11 +27,6 @@ async function retrieveEmails() {
        }
    }

    async function scanForPhishingEmails(emails) {
        const phishingThreshold = 3; // Threshold for determining a potential phishing attempt
        const phishingResults = [];
	@@ -48,7 +42,6 @@ async function scanForPhishingEmails(emails) {
        return phishingResults;
    }

    async function getMessage(email) {
        try {
            const res = await gmail.users.messages.get({ userId: 'me', id: email.id });
	@@ -64,11 +57,8 @@ async function getMessage(email) {
        }
    }

    function calculatePhishingScore(message) {
        let phishingScore = 0;
        const phishingKeywords = ['urgent', 'verify', 'password', 'account', 'suspicious'];
        for (const keyword of phishingKeywords) {
            if (message.subject.toLowerCase().includes(keyword)) {
	@@ -81,33 +71,26 @@ async function getMessage(email) {
        return phishingScore;
    }

    async function sendNotification(phishingResults) {
        try {
            const { token } = await oAuth2Client.getAccessToken();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: 'margo.emstorment@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: ACCESS_TOKEN,
                }
            });
            const mailOptions = {
                from: 'margo.emstorment@gmail.com',
                to: 'test.foster2024@gmail.com',
                subject: 'Phishing Attempt Detected',
                text: `Dear user, \n\nWe have detected a potential phishing attempt in your email inbox with keywords of "urgent', 'verify', 'password', 'account', 'suspicious" Please check to ensure the user is known. \n\nBest regards, \nPhishDefender Team`
            };
            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent...', result);
        } catch (error) {
	@@ -116,7 +99,6 @@ async function getMessage(email) {
        }
    }

    async function processEmails() {
        try {
            const emails = await retrieveEmails();
	@@ -131,3 +113,7 @@ async function getMessage(email) {
    }

    processEmails();
}

main();
