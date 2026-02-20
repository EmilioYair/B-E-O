require('dotenv').config();
const https = require('https');

const apiKey = process.env.FIREBASE_API_KEY;
console.log("Testing API Key:", apiKey ? "Present" : "Missing");

if (!apiKey) {
    console.error("API Key is missing!");
    process.exit(1);
}

const data = JSON.stringify({
    returnSecureToken: true
});

const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signUp?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log("Response Status:", res.statusCode);
        console.log("Response Body:", body);
    });
});

req.on('error', (e) => {
    console.error("Network Error:", e);
});

req.write(data);
req.end();
