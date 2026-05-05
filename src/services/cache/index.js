const cacheService = require("./cache.service");
const CacheManager = require("./cache.manager");

module.exports = {
  default: cacheService,
  cacheService,
  CacheManager,
};
