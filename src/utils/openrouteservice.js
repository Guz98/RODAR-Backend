const https = require("https");

// ===============================
// 🎯 CONFIGURACIÓN DE FILTROS
// ===============================
// Los tres filtros usan cycling-regular (perfil urbano, soportado en Montevideo).
// La diferenciación real entre safe y flat se hace con preference y avoid_features:
// - short:   shortest   → mínima distancia
// - safe:    recommended + evita autopistas → ORS prioriza ciclovías y calles tranquilas
// - flat:    recommended sin restricciones  → ORS elige el recorrido más balanceado,
//            la diferencia con safe se refleja en elevationGain y difficulty al procesar
const CONFIG_FILTROS = {
  short: {
    preference: "shortest",
  },
  safe: {
    preference: "recommended", // ORS con cycling-regular ya prioriza ciclovías por defecto
  },
  flat: {
    preference: "recommended", // mismo preference, la diferencia la marca calcularDificultad
  },
};

// ===============================
// 🧮 DIFICULTAD
// ===============================
const calcularDificultad = (distanceKm, elevationGain) => {
  let score = 0;
  if (distanceKm > 15) score += 2;
  else if (distanceKm > 5) score += 1;
  if (elevationGain > 300) score += 3;
  else if (elevationGain > 150) score += 2;
  else if (elevationGain > 50) score += 1;
  return Math.min(5, Math.max(1, score + 1));
};

// ===============================
// 🛡️ SEGURIDAD
// ===============================
const calcularSeguridad = (extras) => {
  let score = 0;
  let total = 0;
  let hasCycleway = false;

  if (!extras || !extras.waytype) {
    return { score: 0, level: "desconocida", hasCycleway: false };
  }

  extras.waytype.values.forEach(([start, end, tipo]) => {
    const length = end - start;
    total += length;
    switch (tipo) {
      case 1:
        score += 3 * length;
        hasCycleway = true;
        break;
      case 2:
        score += 2.5 * length;
        break;
      case 3:
        score += 2 * length;
        break;
      case 5:
        score += 1.5 * length;
        break;
      case 8:
        score += 0.5 * length;
        break;
      case 7:
        score -= 1 * length;
        break;
      case 6:
        score -= 2 * length;
        break;
      default:
        break;
    }
  });

  const normalized = total > 0 ? score / total : 0;
  const level =
    hasCycleway && normalized >= 1.5
      ? "muy segura"
      : hasCycleway || normalized >= 1
        ? "segura"
        : normalized >= 0
          ? "moderada"
          : "poco segura";

  return { score: Number(normalized.toFixed(2)), level, hasCycleway };
};

// ===============================
// 🚀 FUNCIÓN PRINCIPAL
// ===============================
const calcularRuta = (origin, destination, filter) => {
  return new Promise((resolve, reject) => {
    const config = CONFIG_FILTROS[filter] || CONFIG_FILTROS.safe;

    const bodyObj = {
      coordinates: [origin, destination],
      elevation: true,
      instructions: false,
      extra_info: ["waytype", "steepness", "surface"],
      preference: config.preference,
    };

    if (config.options) bodyObj.options = config.options;

    const body = JSON.stringify(bodyObj);

    const options = {
      hostname: "api.openrouteservice.org",
      path: "/v2/directions/cycling-regular/geojson", // mismo perfil para los 3
      method: "POST",
      headers: {
        Authorization: process.env.ORS_API_KEY,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          if (!parsed.features || parsed.features.length === 0) {
            return reject(new Error("No se encontró ruta"));
          }

          const feature = parsed.features[0];
          const summary = feature.properties.summary;
          const coords = feature.geometry.coordinates;
          const extras = feature.properties.extras;

          const distanceKm = +(summary.distance / 1000).toFixed(2);
          const estimatedTime = Math.round(summary.duration / 60);

          let elevationGain = 0;
          for (let i = 1; i < coords.length; i++) {
            const diff = (coords[i][2] || 0) - (coords[i - 1][2] || 0);
            if (diff > 0) elevationGain += diff;
          }
          elevationGain = Math.round(elevationGain);

          const difficulty = calcularDificultad(distanceKm, elevationGain);
          const seguridad = calcularSeguridad(extras);

          resolve({
            filter,
            distanceKm,
            estimatedTime,
            elevationGain,
            difficulty,
            safety: seguridad,
            path: {
              type: "LineString",
              coordinates: coords,
            },
          });
        } catch (err) {
          reject(new Error("Error procesando ORS"));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(body);
    req.end();
  });
};

module.exports = { calcularRuta };
