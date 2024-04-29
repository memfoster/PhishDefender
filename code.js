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
        auth: oAuth2Client,
    });

    async function retrieveEmails() {
        try {
            const res = await gmail.users.messages.list({ userId: 'me' });
            const messages = res.data.messages || [];
            return messages;
        } catch (error) {
            console.error('Error retrieving emails:', error);
            return [];
        }
    }

    async function scanForPhishingEmails(emails) {
        const phishingThreshold = 3; // Threshold for determining a potential phishing attempt
        const phishingResults = [];

        for (const email of emails) {
            const message = await getMessage(email); // Pass the email directly to getMessage
            const phishingScore = calculatePhishingScore(message);
            if (phishingScore >= phishingThreshold) {
                phishingResults.push({ sender: message.sender, subject: message.subject, score: phishingScore });
            }
        }

        return phishingResults;
    }

    async function getMessage(email) {
        try {
            const res = await gmail.users.messages.get({ userId: 'me', id: email.id });
            const message = {
                sender: res.data.payload.headers.find(header => header.name === 'From').value,
                subject: res.data.payload.headers.find(header => header.name === 'Subject').value,
                body: res.data.snippet 
            };
            return message;
        } catch (error) {
            console.error(`Error retrieving message ${email.id}:`, error);
            return null;
        }
    }

    // Function to calculate phishing score based on the message content
function calculatePhishingScore(message) {
    let phishingScore = 0;
    // Common phishing indicators
    const phishingKeywords = ['urgent', 'verify', 'password', 'account', 'suspicious', 'alert', 'confirm', 'unusual', 'login', 'information', 'update'];
    
    // Additional phishing patterns
    const additionalPhishingPatterns = [
        /your (?:email|account|password|username) has been compromised/i,
        /security alert: /i,
        /action required: /i,
        /your (?:account|email) will be suspended/i,
        /click here to (?:verify|confirm|reset) your (?:account|password)/i,
        /unusual login activity detected/i
    ];

    // Smishing patterns
    const smishingPatterns = [
        /please call this number to verify your account/i,
        /you've won a prize, click here to claim/i,
        /your bank account has been locked, click here to unlock/i,
        /urgent: your package delivery is delayed, click here to reschedule/i
    ];
    
    // Check for common phishing keywords
    for (const keyword of phishingKeywords) {
        if (message.subject.toLowerCase().includes(keyword)) {
            phishingScore += 2; // Increase score for subject match
        }
        if (message.body.toLowerCase().includes(keyword)) {
            phishingScore++; // Increase score for body match
        }
    }
    
    // Check for additional phishing patterns
    for (const pattern of additionalPhishingPatterns) {
        if (pattern.test(message.subject) || pattern.test(message.body)) {
            phishingScore += 3; // Increase score for pattern match
        }
    }
    
    // Check for smishing patterns
    for (const pattern of smishingPatterns) {
        if (pattern.test(message.subject) || pattern.test(message.body)) {
            phishingScore += 4; // Increase score for smishing pattern match
        }
    }
    
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
                    accessToken: token,
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
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async function processEmails() {
        try {
            const emails = await retrieveEmails();
            const phishingResults = await scanForPhishingEmails(emails);
            console.log('Phishing results:', phishingResults);
            if (phishingResults.length > 0) {
                await sendNotification(phishingResults);
            }
        } catch (error) {
            console.error('Error processing emails:', error);
        }
    }

    processEmails();
}

main();

