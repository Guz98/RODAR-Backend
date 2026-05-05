const CacheManager = require("./cache.manager");

/**
 * CacheService - Servicio singleton de cache
 * Responsable de:
 * - Proporcionar una interfaz única para toda la aplicación
 * - Manejar la instancia singleton del CacheManager
 * - Simplificar la API de cache para los repositories
 */
class CacheService {
  constructor() {
    this.cacheManager = null;
  }

  getInstance() {
    if (!this.cacheManager) {
      this.cacheManager = new CacheManager();
    }
    return this.cacheManager;
  }

  async get(key) {
    try {
      return await this.getInstance().getItem(key);
    } catch (error) {
      if (this.isDebugEnabled()) {
        console.error(
          `[CacheService] Error getting key ${key}:`,
          error.message,
        );
      }
      return null; // falla silenciosamente — no rompe la app si el cache falla
    }
  }

  async set(key, value, ttl = 300) {
    try {
      return await this.getInstance().setItem(key, value, ttl);
    } catch (error) {
      if (this.isDebugEnabled()) {
        console.error(
          `[CacheService] Error setting key ${key}:`,
          error.message,
        );
      }
      return false;
    }
  }

  async delete(key) {
    try {
      return await this.getInstance().del(key);
    } catch (error) {
      if (this.isDebugEnabled()) {
        console.error(
          `[CacheService] Error deleting key ${key}:`,
          error.message,
        );
      }
      return false;
    }
  }

  getType() {
    return this.getInstance().getType();
  }
  isDebugEnabled() {
    return this.getInstance().isDebugEnabled();
  }

  // Invalida múltiples keys a la vez — útil cuando cambian datos relacionados
  async invalidateMultiple(keys) {
    const promises = keys.map((key) => this.delete(key));
    return await Promise.all(promises);
  }

  // Genera una key consistente para el cache
  // Ejemplo: generateKey("workshops", "nearby", lng, lat) → "workshops:nearby:-56.16:-34.90"
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(":")}`;
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
