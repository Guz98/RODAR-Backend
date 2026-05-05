const { createCacheAdapter } = require("./adapters");

/**
 * CacheManager - Maneja la lógica de cache y la selección de adaptadores
 */
class CacheManager {
  #type;
  #debug;

  constructor(type = null, debug = null) {
    this.#type = type || process.env.CACHE_TYPE || "in-memory";
    this.#debug = debug !== null ? debug : process.env.CACHE_DEBUG === "true";
    this.client = createCacheAdapter(this.#type);

    if (this.#debug) {
      console.log(`Cache initialized: ${this.#type.toUpperCase()}`);
    }
  }

  async getItem(key) {
    if (this.#debug) {
      console.log(`[Reading from Cache]: ${key}`);
    }
    const value = await this.client.get(key);
    if (value === null || value === undefined) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value; // si no es JSON lo devuelve tal cual
    }
  }

  async setItem(key, value, ttl) {
    if (this.#debug) {
      console.log(`[Writing in Cache] key: ${key}`);
    }
    const serializedValue = JSON.stringify(value);
    return Promise.resolve(this.client.set(key, serializedValue, ttl));
  }

  async del(key) {
    if (this.#debug) {
      console.log(`[Deleting from Cache]: ${key}`);
    }
    return await this.client.del(key);
  }

  getType() {
    return this.#type;
  }
  isDebugEnabled() {
    return this.#debug;
  }
}

module.exports = CacheManager;
