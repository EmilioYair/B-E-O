const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    console.log('Dotenv error:', result.error);
}

console.log('Parsed:', result.parsed);
console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY);
