const https = require("https");

// ===============================
// 🎯 CONFIGURACIÓN DE FILTROS
// ===============================
// Cada filtro le indica a ORS cómo priorizar el recorrido
// "shortest" minimiza distancia — "recommended" deja que ORS elija la más balanceada
// La diferenciación entre "safe" y "flat" se hace en calcularSeguridad y calcularDificultad
const CONFIG_FILTROS = {
  short: {
    preference: "shortest", // mínima distancia sin importar tipo de calle
  },
  flat: {
    preference: "recommended", // misma preferencia que safe — la diferencia la marca
  }, // calcularDificultad usando el desnivel del recorrido
  safe: {
    preference: "recommended", // misma preferencia que flat — la diferencia la marca
  }, // calcularSeguridad usando el waytype de cada segmento
};

// ===============================
// 🧮 DIFICULTAD
// ===============================
// Calcula un nivel del 1 al 5 en base a distancia y desnivel acumulado
// No depende del filtro — refleja el esfuerzo físico real del recorrido
const calcularDificultad = (distanceKm, elevationGain) => {
  let score = 0;

  // Puntos por distancia
  if (distanceKm > 15)
    score += 2; // recorrido largo
  else if (distanceKm > 5) score += 1; // recorrido medio

  // Puntos por desnivel acumulado (solo cuenta las subidas)
  if (elevationGain > 300)
    score += 3; // muy exigente
  else if (elevationGain > 150)
    score += 2; // bastante desnivel
  else if (elevationGain > 50) score += 1; // algún repecho

  // Score 0-5 → nivel 1-5 (mínimo 1, máximo 5)
  return Math.min(5, Math.max(1, score + 1));
};

// ===============================
// 🛡️ SEGURIDAD
// ===============================
// Calcula el nivel de seguridad de la ruta usando el campo "waytype"
// que devuelve ORS — indica el tipo de vía de cada segmento del recorrido
// Los valores de "tipo" corresponden a la clasificación interna de ORS:
// 1=ciclovía, 2=camino, 3=calle compartida, 5=residencial, 6=primaria, 7=secundaria, 8=terciaria
const calcularSeguridad = (extras) => {
  let score = 0;
  let total = 0;
  let hasCycleway = false;

  // Si ORS no devolvió información de waytype, no se puede calcular
  if (!extras || !extras.waytype) {
    return { score: 0, level: "desconocida", hasCycleway: false };
  }

  // Cada elemento de waytype.values es [puntoInicio, puntoFin, tipoDeVia]
  // Se pondera el score por la longitud de cada segmento para que los tramos
  // más largos tengan más peso en el resultado final
  extras.waytype.values.forEach(([start, end, tipo]) => {
    const length = end - start; // longitud del segmento en puntos
    total += length;

    switch (tipo) {
      case 1: // ciclovía dedicada — máxima seguridad, sin autos
        score += 3 * length;
        hasCycleway = true;
        break;
      case 2: // camino — tranquilo, poco tráfico vehicular
        score += 2.5 * length;
        break;
      case 3: // calle compartida (living street) — velocidad muy baja, segura
        score += 2 * length;
        break;
      case 5: // calle residencial — tráfico liviano, tranquila
        score += 1.5 * length;
        break;
      case 8: // calle terciaria — algo de tráfico pero manejable
        score += 0.5 * length;
        break;
      case 7: // avenida secundaria — tráfico moderado, menos tranquila
        score -= 1 * length;
        break;
      case 6: // avenida principal — tráfico denso, menos recomendable para ciclistas
        score -= 2 * length;
        break;
      default:
        score += 0;
    }
  });

  // Normaliza el score dividiéndolo por la longitud total del recorrido
  // Así el resultado no depende de la distancia sino del tipo de vía predominante
  const normalized = total > 0 ? score / total : 0;

  // El nivel prioriza si hay ciclovía sobre el score numérico
  // porque en Montevideo la red de ciclovías es discontinua y cualquier tramo suma
  const level =
    hasCycleway && normalized >= 1.5
      ? "muy segura" // ciclovías y calles tranquilas predominan
      : hasCycleway || normalized >= 1
        ? "segura" // mayormente calles residenciales con alguna ciclovía
        : normalized >= 0
          ? "moderada" // mix de calles tranquilas y avenidas
          : "poco segura"; // predominan avenidas transitadas

  return {
    score: Number(normalized.toFixed(2)), // score normalizado redondeado a 2 decimales
    level,
    hasCycleway, // true si al menos un segmento es ciclovía
  };
};

// ===============================
// 🚀 FUNCIÓN PRINCIPAL
// ===============================
// Llama a la API de OpenRouteService y devuelve la ruta calculada
// con distancia, tiempo, desnivel, dificultad y nivel de seguridad
const calcularRuta = (origin, destination, filter) => {
  return new Promise((resolve, reject) => {
    // Elige la configuración según el filtro del usuario
    const config = CONFIG_FILTROS[filter] || CONFIG_FILTROS.safe;

    // Arma el body del request a ORS
    // extra_info pide datos adicionales por segmento:
    // waytype = tipo de vía, steepness = pendiente, surface = superficie
    const body = JSON.stringify({
      coordinates: [origin, destination], // [origen, destino] en formato [lng, lat]
      elevation: true, // incluye altura en cada coordenada para calcular desnivel
      instructions: false, // no necesitamos indicaciones paso a paso
      extra_info: ["waytype", "steepness", "surface"], // datos extra por segmento
      ...config, // agrega la preferencia del filtro elegido
    });

    // Configuración del request HTTPS a ORS
    // Todos los filtros usan cycling-regular — la diferencia está en la preferencia
    const options = {
      hostname: "api.openrouteservice.org",
      path: "/v2/directions/cycling-regular/geojson",
      method: "POST",
      headers: {
        Authorization: process.env.ORS_API_KEY, // API key desde el .env
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    // Ejecuta el request HTTPS a ORS
    const req = https.request(options, (res) => {
      let data = "";

      // ORS devuelve la respuesta en partes (chunks), las acumula
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Cuando terminó de recibir toda la respuesta, la procesa
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          // Si ORS no encontró ninguna ruta posible entre esos dos puntos
          if (!parsed.features || parsed.features.length === 0) {
            return reject(new Error("No se encontró ruta"));
          }

          const feature = parsed.features[0];
          const summary = feature.properties.summary; // distancia y duración totales
          const coords = feature.geometry.coordinates; // puntos del recorrido [lng, lat, elevation]
          const extras = feature.properties.extras; // datos extra por segmento (waytype, etc)

          // ORS devuelve distancia en metros → convertimos a km
          const distanceKm = +(summary.distance / 1000).toFixed(2);

          // ORS devuelve duración en segundos → convertimos a minutos
          const estimatedTime = Math.round(summary.duration / 60);

          // Calcula el desnivel acumulado sumando solo las subidas
          // Cada coordenada tiene [lng, lat, elevation] — compara punto a punto
          let elevationGain = 0;
          for (let i = 1; i < coords.length; i++) {
            const diff = (coords[i][2] || 0) - (coords[i - 1][2] || 0);
            if (diff > 0) elevationGain += diff; // solo cuenta las subidas, no las bajadas
          }
          elevationGain = Math.round(elevationGain); // redondea a metros enteros

          // Calcula dificultad (1-5) en base a distancia y desnivel
          const difficulty = calcularDificultad(distanceKm, elevationGain);

          // Calcula seguridad usando los tipos de vía que devolvió ORS
          const seguridad = calcularSeguridad(extras);

          // Resuelve la Promise con todos los datos procesados
          resolve({
            filter,
            distanceKm,
            estimatedTime,
            elevationGain,
            difficulty,
            safety: seguridad,
            path: {
              type: "LineString",
              coordinates: coords, // el trayecto completo para dibujar en el mapa del frontend
            },
          });
        } catch (err) {
          // Si falló el parseo de la respuesta de ORS
          reject(new Error("Error procesando ORS"));
        }
      });
    });

    // Si falló la conexión con ORS (sin internet, timeout, etc.)
    req.on("error", (err) => reject(err));

    // Envía el body y cierra la conexión
    req.write(body);
    req.end();
  });
};

// Exporta solo calcularRuta — las funciones de cálculo son internas
module.exports = { calcularRuta };
