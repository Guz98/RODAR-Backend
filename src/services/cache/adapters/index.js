/**
 * Cache Adapters - Punto de entrada para todos los adaptadores de cache
 *
 * Cada adaptador implementa la misma interfaz básica:
 * - get(key): Obtener valor
 * - set(key, value, ttl): Establecer valor con TTL opcional
 * - del(key): Eliminar valor
 */

const createInMemoryAdapter = require("./in-memory.adapter");

/**
 * Factory para crear adaptadores de cache
 * @param {string} type - Tipo de adaptador ('in-memory')
 * @returns {Object} Instancia del adaptador
 */
const createCacheAdapter = (type = "in-memory") => {
  switch (type.toLowerCase()) {
    case "in-memory":
    case "memory":
      return createInMemoryAdapter();
    default:
      console.warn(
        `[Cache] Adaptador "${type}" no reconocido, usando in-memory`,
      );
      return createInMemoryAdapter();
  }
};

const getSupportedAdapters = () => {
  return ["in-memory", "memory"];
};

module.exports = {
  createCacheAdapter,
  getSupportedAdapters,
  createInMemoryAdapter,
};
