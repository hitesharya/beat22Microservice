// middlewares/redisCacheMiddleware.js
const redisClient = require("../utils/redisClient");

module.exports = (prefix = "", ttl = 300) => {
  return async (req, res, next) => {
    try {
      // Generate cache key using route and user (or params/query)
      const userId = req.user?.id || ""; // Use JWT middleware
      const key = `${prefix}:${userId}`;
      console.log("redisClient==>", redisClient);

      if (!redisClient.isReady) {
        console.error("Redis is not connected!");

        next();

        // Optionally reconnect or fallback to DB-only flow
      }
      // Try getting cached data
      const cachedData = await redisClient.get(key);
      console.log("cahedData", cachedData);
      if (cachedData) {
        return res.status(200).json({
          fromCache: true,
          data: JSON.parse(cachedData),
        });
      }

      // Hook res.send to cache data before sending
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        if (res.statusCode === 200 && body) {
          await redisClient.setEx(key, ttl, JSON.stringify(body.data || body));
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Redis middleware error:", err);
      next(); // Skip cache on error
    }
  };
};
