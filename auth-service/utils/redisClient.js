const { createClient } = require('redis');

const redisClient = createClient();

redisClient.on('error', (err) => console.error('Redis error:', err));

redisClient.connect();

module.exports = redisClient;