const nodemailer = require('nodemailer')
const { google } = require('googleapis') 

async function main() {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    const redirectUri = 'https://developers.google.com/oauthplayground'

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri)
    oAuth2Client.setCredentials({access_token: accessToken, refresh_token: refresh_Token})
    
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

retrieveEmails()
    .then(messages => console.log('Messages:', messages))
    .catch(error => console.error('Error:', error));
  
// Function to scan for phishing emails
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

// Function to retrieve a specific email message
async function getMessage(email) {
    try {
        const res = await gmail.users.messages.get({ userId: 'me', id: email.id });
        const message = {
            sender: res.data.payload.headers.find(header => header.name === 'From').value,
            subject: res.data.payload.headers.find(header => header.name === 'Subject').value,
            body: res.data.snippet // You can also fetch the full body if needed: res.data.payload.parts[0].body.data
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
    const phishingKeywords = ['urgent', 'verify', 'password', 'account', 'suspicious'];
    for (const keyword of phishingKeywords) {
      if (message.subject.toLowerCase().includes(keyword)) {
        phishingScore++;
      }
      if (message.body.toLowerCase().includes(keyword)) {
        phishingScore++;
      }
    }
    return phishingScore;
  }
  
  // Function to send notification
  async function sendNotification(phishingResults) {
    try {
      // Get access token
      const { token } = await oAuth2Client.getAccessToken();
  
      // Create nodemailer transport
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'margo.emstorment@gmail.com',
          clientId: client_id,
          clientSecret: client_secret,
          refresh_Token: refresh_Token,
          accessToken: token,
        }
      });
  
      // Compose email message
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
  
  // Example usage
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

