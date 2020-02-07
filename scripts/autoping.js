const request = require('request');
const path = require('path');

const pingHost = process.env.HOST || 'https://alice-lol-guide.herokuapp.com/';

if (!pingHost) {
    console.log('env HOST not found');
    process.exit(0);
}

// Every 10 minutes ping some host
setInterval(() => {
    try { request.get(path.join(pingHost, 'ping')); } catch (e) {}
}, 10 * 60 * 1000);
