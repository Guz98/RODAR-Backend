const NodeCache = require("node-cache");

/**
 * InMemoryAdapter - Adaptador de cache en memoria usando NodeCache
 */
let client = null;

const createInMemoryAdapter = () => {
  if (!client) {
    client = new NodeCache();
    if (process.env.CACHE_DEBUG === "true") {
      console.log("[In-memory Cache] Connected Successfully");
    }
  }
  return client;
};

module.exports = createInMemoryAdapter;
