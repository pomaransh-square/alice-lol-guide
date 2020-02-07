const request = require('request');
const path = require('path');

const pingHost = process.env.HOST || 'https://alice-lol-guide.herokuapp.com/';

// Every 10 minutes ping some host
setInterval(() => {
    try { request.get(path.join(pingHost, 'ping')); } catch (e) {}
}, 10 * 60 * 1000);
