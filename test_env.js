require('dotenv').config();
console.log('API_KEY:', process.env.FIREBASE_API_KEY ? 'Loaded' : 'Not Loaded');
console.log('AUTH_DOMAIN:', process.env.FIREBASE_AUTH_DOMAIN ? 'Loaded' : 'Not Loaded');
try {
    const { app } = require('./bd/bd');
    console.log('Firebase initialized:', app ? 'Yes' : 'No');
} catch (error) {
    console.error('Error initializing firebase:', error.message);
}
