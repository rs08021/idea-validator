export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: "Falta el campo idea" });

  const SYSTEM_PROMPT = `Eres un co-founder experto en validación de ideas de negocio para mercados latinoamericanos.
Analiza ideas de negocio considerando SIEMPRE este contexto fijo del usuario:
- Meta de ingreso: $2,000/mes
- Mercado objetivo: LATAM
- Base de operaciones: El Salvador
- Modelo de trabajo: solopreneur + IA (una sola persona apoyada por herramientas de IA, con potencial de escalar)

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin backticks. El JSON debe tener exactamente esta estructura:
{
  "score_validacion": <número 1-10>,
  "score_potencial": <número 1-10>,
  "score_ejecutable": <número 1-10>,
  "score_total": <promedio de los 3 scores con 1 decimal>,
  "nivel": <"Alta viabilidad" | "Viabilidad media" | "Baja viabilidad">,
  "resumen": <string de 1 oración máx 100 chars>,
  "pros": [<string>, <string>, <string>],
  "contras": [<string>, <string>, <string>],
  "tiempo_lanzamiento": <string ej: "4–6 semanas">,
  "precio_estimado": <string ej: "$50–150/mes">,
  "clientes_meta": <string ej: "20">,
  "primer_paso": <string accionable de 1-2 oraciones específico para El Salvador>
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Analiza esta idea de negocio: "${idea}"` }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al analizar la idea" });
  }
}
