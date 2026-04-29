import { useState, useCallback } from "react";

const CONTEXT = {
  meta: "$2,000/mes",
  mercado: "LATAM",
  base: "El Salvador",
  modelo: "solopreneur + IA",
};

const SYSTEM_PROMPT = `Eres un co-founder experto en validación de ideas de negocio para mercados latinoamericanos.
Analiza ideas de negocio considerando SIEMPRE este contexto fijo del usuario:
- Meta de ingreso: ${CONTEXT.meta}
- Mercado objetivo: ${CONTEXT.mercado}
- Base de operaciones: ${CONTEXT.base}
- Modelo de trabajo: ${CONTEXT.modelo} (una sola persona apoyada por herramientas de IA, con potencial de escalar)

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

const DEMO_IDEAS = [
  {
    id: 1,
    texto: "Cotizador automático para agencias de viaje pequeñas en LATAM. SaaS con suscripción mensual.",
    fecha: "2026-04-20",
    estado: "en_progreso",
    analisis: {
      score_validacion: 8.5, score_potencial: 9.0, score_ejecutable: 8.0,
      score_total: 8.5, nivel: "Alta viabilidad",
      resumen: "Ingresos recurrentes con 20 agencias a $100/mes = $2,000/mes.",
      pros: ["Mercado desatendido en LATAM", "Modelo de suscripción predecible", "Se construye con IA sin equipo"],
      contras: ["Requiere soporte post-venta", "Ciclo de venta de 2–4 semanas", "Necesita validación presencial"],
      tiempo_lanzamiento: "4–6 semanas", precio_estimado: "$50–150/mes",
      clientes_meta: "20",
      primer_paso: "Entrevistar 3 agencias locales esta semana para validar disposición de pago.",
    },
  },
  {
    id: 2,
    texto: "Speech-to-text con analytics para call centers en español. Transcripción + sentimiento + KPIs.",
    fecha: "2026-04-24",
    estado: "pendiente",
    analisis: {
      score_validacion: 7.5, score_potencial: 8.5, score_ejecutable: 7.0,
      score_total: 7.7, nivel: "Alta viabilidad",
      resumen: "Alto valor por cliente pero ciclo de venta corporativo largo.",
      pros: ["Ticket alto $200–500/mes por cliente", "Diferenciado en español LATAM", "API de Whisper disponible"],
      contras: ["Ciclo de venta corporativo 2–6 meses", "Competencia de AWS y Google", "Requiere demos técnicos"],
      tiempo_lanzamiento: "8–12 semanas", precio_estimado: "$200–500/mes",
      clientes_meta: "5–10",
      primer_paso: "Identificar un call center local en El Salvador dispuesto a hacer un piloto gratuito de 30 días.",
    },
  },
];

const scoreColor = (s) => {
  if (s >= 8) return { ring: "#10b981", text: "#10b981", bg: "#052e16" };
  if (s >= 6) return { ring: "#f59e0b", text: "#f59e0b", bg: "#1c1700" };
  return { ring: "#ef4444", text: "#ef4444", bg: "#1c0707" };
};

const s = {
  app: {
    minHeight: "100dvh",
    background: "#0f0f0f",
    color: "#e8e6e1",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "env(safe-area-inset-top, 16px) 20px 0",
    paddingTop: "max(env(safe-area-inset-top), 16px)",
    borderBottom: "1px solid #1e1e1e",
    background: "#0f0f0f",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  body: {
    padding: "20px",
    flex: 1,
    overflowY: "auto",
    paddingBottom: "env(safe-area-inset-bottom, 24px)",
  },
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 16,
    padding: "16px",
    marginBottom: 12,
    cursor: "pointer",
    transition: "border-color 0.15s, transform 0.1s",
  },
  statCard: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: "14px",
    flex: 1,
    textAlign: "center",
  },
  btn: {
    width: "100%",
    padding: "14px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    marginBottom: 10,
    transition: "opacity 0.15s, transform 0.1s",
    WebkitTapHighlightColor: "transparent",
  },
  btnPrimary: { background: "#10b981", color: "#fff" },
  btnSecondary: { background: "#1e1e1e", color: "#9ca3af", border: "1px solid #262626" },
  btnDanger: { background: "#1e1e1e", color: "#ef4444", border: "1px solid #3f1818" },
  tag: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 500,
    padding: "3px 9px",
    borderRadius: 99,
    marginRight: 6,
    marginTop: 6,
  },
  textarea: {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: 14,
    color: "#e8e6e1",
    fontSize: 15,
    lineHeight: 1.6,
    resize: "none",
    fontFamily: "inherit",
    outline: "none",
    WebkitAppearance: "none",
  },
  label: {
    fontSize: 11,
    color: "#555",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  },
  dimBar: {
    flex: 1,
    height: 5,
    background: "#1e1e1e",
    borderRadius: 4,
    margin: "0 10px",
    overflow: "hidden",
  },
  filterBtn: (active) => ({
    padding: "6px 14px",
    borderRadius: 99,
    fontSize: 12,
    fontWeight: 500,
    border: active ? "1px solid #10b981" : "1px solid #262626",
    background: active ? "#052e16" : "#161616",
    color: active ? "#10b981" : "#666",
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    whiteSpace: "nowrap",
  }),
  backBtn: {
    background: "#1e1e1e",
    border: "1px solid #262626",
    borderRadius: 8,
    padding: "6px 12px",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: 13,
    WebkitTapHighlightColor: "transparent",
  },
};

const ScoreRing = ({ score, size = 64 }) => {
  const c = scoreColor(score);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2.5px solid ${c.ring}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      flexShrink: 0, background: "#161616",
    }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 600, color: c.ring, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: 9, color: c.ring, opacity: 0.7 }}>/10</span>
    </div>
  );
};

const BarDim = ({ label, value }) => {
  const c = scoreColor(value);
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e1e1e" }}>
      <span style={{ fontSize: 13, color: "#9ca3af", width: 110, flexShrink: 0 }}>{label}</span>
      <div style={s.dimBar}>
        <div style={{ height: "100%", width: `${value * 10}%`, background: c.ring, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: c.ring, width: 28, textAlign: "right" }}>{value}</span>
    </div>
  );
};

const EstadoTag = ({ estado }) => {
  const m = {
    pendiente: ["#facc15", "#1c1700", "Pendiente"],
    en_progreso: ["#10b981", "#052e16", "En progreso"],
    descartada: ["#ef4444", "#1c0707", "Descartada"],
  };
  const [col, bg, txt] = m[estado] || ["#666", "#111", "—"];
  return <span style={{ ...s.tag, background: bg, color: col }}>{txt}</span>;
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [ideas, setIdeas] = useState(DEMO_IDEAS);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [analisisActual, setAnalisisActual] = useState(null);
  const [textoActual, setTextoActual] = useState("");
  const [ideaDetalle, setIdeaDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [error, setError] = useState("");

  const analizar = useCallback(async () => {
    if (!texto.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: texto }),
      });
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      const safe = {
        score_validacion: parsed.score_validacion ?? 5,
        score_potencial: parsed.score_potencial ?? 5,
        score_ejecutable: parsed.score_ejecutable ?? 5,
        score_total: parsed.score_total ?? 5,
        nivel: parsed.nivel ?? "Viabilidad media",
        resumen: parsed.resumen ?? "Análisis completado.",
        pros: Array.isArray(parsed.pros) ? parsed.pros : ["Ver análisis completo"],
        contras: Array.isArray(parsed.contras) ? parsed.contras : ["Requiere validación"],
        tiempo_lanzamiento: parsed.tiempo_lanzamiento ?? "A definir",
        precio_estimado: parsed.precio_estimado ?? "A definir",
        clientes_meta: parsed.clientes_meta ?? "A definir",
        primer_paso: parsed.primer_paso ?? "Validar la idea con potenciales clientes.",
      };
      setAnalisisActual(safe);
      setTextoActual(texto);
      setScreen("resultado");
    } catch {
      setError("No se pudo analizar. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [texto]);

  const guardarIdea = () => {
    const nueva = {
      id: Date.now(),
      texto: textoActual,
      fecha: new Date().toISOString().split("T")[0],
      estado: "pendiente",
      analisis: analisisActual,
    };
    setIdeas((prev) => [nueva, ...prev]);
    setTexto("");
    setAnalisisActual(null);
    setScreen("home");
  };

  const ideasFiltradas = ideas.filter((i) =>
    filtro === "todas" ? true : i.estado === filtro
  );

  if (screen === "home") return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "#555", margin: "0 0 2px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Idea Validator</p>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: "#e8e6e1" }}>Mis ideas</h1>
          </div>
          <button onClick={() => setScreen("nueva")} style={{
            background: "#10b981", color: "#fff", border: "none",
            borderRadius: 10, padding: "9px 18px", fontSize: 14, fontWeight: 500, cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}>+ Nueva</button>
        </div>
        <div style={{ display: "flex", gap: 8, paddingBottom: 14, overflowX: "auto" }}>
          {["todas", "pendiente", "en_progreso", "descartada"].map((f) => (
            <button key={f} style={s.filterBtn(filtro === f)} onClick={() => setFiltro(f)}>
              {f === "todas" ? "Todas" : f === "en_progreso" ? "En progreso" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div style={s.body}>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={s.statCard}>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "0 0 2px", color: "#e8e6e1" }}>{ideas.length}</p>
            <p style={{ fontSize: 11, color: "#555", margin: 0 }}>guardadas</p>
          </div>
          <div style={s.statCard}>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "0 0 2px", color: "#10b981" }}>
              {ideas.filter((i) => i.estado === "en_progreso").length}
            </p>
            <p style={{ fontSize: 11, color: "#555", margin: 0 }}>en progreso</p>
          </div>
          <div style={s.statCard}>
            <p style={{ fontSize: 26, fontWeight: 600, margin: "0 0 2px", color: "#f59e0b" }}>
              {ideas.length > 0
                ? (ideas.reduce((a, b) => a + b.analisis.score_total, 0) / ideas.length).toFixed(1)
                : "—"}
            </p>
            <p style={{ fontSize: 11, color: "#555", margin: 0 }}>score prom.</p>
          </div>
        </div>

        {ideasFiltradas.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>💡</p>
            <p style={{ fontSize: 15 }}>No hay ideas aquí todavía</p>
          </div>
        )}

        {[...ideasFiltradas]
          .sort((a, b) => b.analisis.score_total - a.analisis.score_total)
          .map((idea) => {
            const c = scoreColor(idea.analisis.score_total);
            return (
              <div
                key={idea.id}
                style={s.card}
                onClick={() => { setIdeaDetalle(idea); setScreen("detalle"); }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 4px", color: "#e8e6e1", lineHeight: 1.4 }}>
                      {idea.texto.length > 80 ? idea.texto.slice(0, 80) + "…" : idea.texto}
                    </p>
                    <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{idea.fecha}</p>
                  </div>
                  <ScoreRing score={idea.analisis.score_total} size={52} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <EstadoTag estado={idea.estado} />
                  <span style={{ ...s.tag, background: "#0d1f16", color: "#10b981" }}>{idea.analisis.nivel}</span>
                </div>
              </div>
            );
          })}

        <div style={{ marginTop: 8, padding: 14, background: "#0d0d0d", borderRadius: 12, border: "1px dashed #1e1e1e" }}>
          <p style={{ fontSize: 12, color: "#555", margin: 0, textAlign: "center" }}>
            Meta: <span style={{ color: "#10b981" }}>$2,000/mes</span> · LATAM · El Salvador · Solopreneur + IA
          </p>
        </div>
      </div>
    </div>
  );

  if (screen === "nueva") return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16 }}>
          <button onClick={() => setScreen("home")} style={s.backBtn}>← Volver</button>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Nueva idea</h2>
        </div>
      </div>
      <div style={s.body}>
        <span style={s.label}>Describí tu idea</span>
        <textarea
          style={s.textarea}
          rows={7}
          placeholder="Escribí tu idea con tus propias palabras. No necesita ser perfecta. Ej: Una app que permite a agencias de viaje generar cotizaciones en segundos..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div style={{ background: "#0d1a14", border: "1px solid #1a3a28", borderRadius: 10, padding: 12, margin: "12px 0 20px" }}>
          <span style={{ ...s.label, color: "#10b981", marginBottom: 4 }}>Contexto fijo del análisis</span>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.7 }}>
            Meta: <strong style={{ color: "#9ca3af" }}>$2,000/mes</strong> · Mercado: <strong style={{ color: "#9ca3af" }}>LATAM</strong> · Base: <strong style={{ color: "#9ca3af" }}>El Salvador</strong> · Modelo: <strong style={{ color: "#9ca3af" }}>Solopreneur + IA</strong>
          </p>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>{error}</p>}
        <button
          onClick={analizar}
          disabled={loading || !texto.trim()}
          style={{ ...s.btn, ...s.btnPrimary, opacity: loading || !texto.trim() ? 0.5 : 1 }}
        >
          {loading ? "Analizando con IA..." : "Analizar con IA"}
        </button>
        <button onClick={() => setScreen("home")} style={{ ...s.btn, ...s.btnSecondary }}>Cancelar</button>
      </div>
    </div>
  );

  if (screen === "resultado" && analisisActual) {
    const a = analisisActual;
    const c = scoreColor(a.score_total);
    return (
      <div style={s.app}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16 }}>
            <button onClick={() => setScreen("nueva")} style={s.backBtn}>← Editar</button>
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Resultado</h2>
          </div>
        </div>
        <div style={s.body}>
          <div style={{ background: "#161616", border: `1px solid ${c.ring}33`, borderRadius: 16, padding: 16, marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
            <ScoreRing score={a.score_total} size={70} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: "#e8e6e1" }}>{a.nivel}</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, lineHeight: 1.5 }}>{a.resumen}</p>
            </div>
          </div>

          <div style={{ background: "#161616", border: "1px solid #262626", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <span style={s.label}>Dimensiones</span>
            <BarDim label="Validación" value={a.score_validacion} />
            <BarDim label="Potencial $" value={a.score_potencial} />
            <div style={{ display: "flex", alignItems: "center", paddingTop: 10 }}>
              <span style={{ fontSize: 13, color: "#9ca3af", width: 110, flexShrink: 0 }}>Ejecutable solo</span>
              <div style={s.dimBar}>
                <div style={{ height: "100%", width: `${a.score_ejecutable * 10}%`, background: scoreColor(a.score_ejecutable).ring, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor(a.score_ejecutable).ring, width: 28, textAlign: "right" }}>{a.score_ejecutable}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ ...s.statCard, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#e8e6e1" }}>{a.tiempo_lanzamiento}</p>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Para lanzar</p>
            </div>
            <div style={{ ...s.statCard, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#10b981" }}>{a.precio_estimado}</p>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Precio</p>
            </div>
            <div style={{ ...s.statCard, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#f59e0b" }}>{a.clientes_meta}</p>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Clientes meta</p>
            </div>
          </div>

          <div style={{ background: "#0d1a14", border: "1px solid #1a3a28", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <span style={{ ...s.label, color: "#10b981" }}>Primer paso concreto</span>
            <p style={{ fontSize: 14, color: "#d1fae5", margin: 0, lineHeight: 1.6 }}>{a.primer_paso}</p>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "#161616", border: "1px solid #262626", borderRadius: 12, padding: 12 }}>
              <span style={{ ...s.label, color: "#10b981" }}>Pros</span>
              {a.pros.map((p, i) => (
                <p key={i} style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 6px", lineHeight: 1.5 }}>· {p}</p>
              ))}
            </div>
            <div style={{ flex: 1, background: "#161616", border: "1px solid #262626", borderRadius: 12, padding: 12 }}>
              <span style={{ ...s.label, color: "#ef4444" }}>Contras</span>
              {a.contras.map((c, i) => (
                <p key={i} style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 6px", lineHeight: 1.5 }}>· {c}</p>
              ))}
            </div>
          </div>

          <button onClick={guardarIdea} style={{ ...s.btn, ...s.btnPrimary }}>Guardar idea</button>
          <button onClick={() => setScreen("home")} style={{ ...s.btn, ...s.btnSecondary }}>Descartar</button>
        </div>
      </div>
    );
  }

  if (screen === "detalle" && ideaDetalle) {
    const a = ideaDetalle.analisis;
    const cambiarEstado = (nuevoEstado) => {
      setIdeas((prev) => prev.map((i) => i.id === ideaDetalle.id ? { ...i, estado: nuevoEstado } : i));
      setIdeaDetalle((prev) => ({ ...prev, estado: nuevoEstado }));
    };
    return (
      <div style={s.app}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16 }}>
            <button onClick={() => setScreen("home")} style={s.backBtn}>← Volver</button>
            <ScoreRing score={a.score_total} size={44} />
          </div>
        </div>
        <div style={s.body}>
          <p style={{ fontSize: 15, color: "#e8e6e1", lineHeight: 1.6, marginBottom: 12 }}>{ideaDetalle.texto}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <EstadoTag estado={ideaDetalle.estado} />
            <span style={{ ...s.tag, background: "#0d1f16", color: "#10b981" }}>{a.nivel}</span>
            <span style={{ fontSize: 12, color: "#555" }}>{ideaDetalle.fecha}</span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["pendiente", "en_progreso", "descartada"].map((e) => (
              <button
                key={e}
                onClick={() => cambiarEstado(e)}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer",
                  background: ideaDetalle.estado === e ? "#0d1a14" : "#161616",
                  border: ideaDetalle.estado === e ? "1px solid #10b981" : "1px solid #262626",
                  color: ideaDetalle.estado === e ? "#10b981" : "#555",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {e === "en_progreso" ? "En progreso" : e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ background: "#161616", border: "1px solid #262626", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <span style={s.label}>Dimensiones</span>
            <BarDim label="Validación" value={a.score_validacion} />
            <BarDim label="Potencial $" value={a.score_potencial} />
            <div style={{ display: "flex", alignItems: "center", paddingTop: 10 }}>
              <span style={{ fontSize: 13, color: "#9ca3af", width: 110, flexShrink: 0 }}>Ejecutable solo</span>
              <div style={s.dimBar}>
                <div style={{ height: "100%", width: `${a.score_ejecutable * 10}%`, background: scoreColor(a.score_ejecutable).ring, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: scoreColor(a.score_ejecutable).ring, width: 28, textAlign: "right" }}>{a.score_ejecutable}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, background: "#161616", border: "1px solid #262626", borderRadius: 12, padding: 12 }}>
              <span style={{ ...s.label, color: "#10b981" }}>Pros</span>
              {a.pros.map((p, i) => <p key={i} style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 6px", lineHeight: 1.5 }}>· {p}</p>)}
            </div>
            <div style={{ flex: 1, background: "#161616", border: "1px solid #262626", borderRadius: 12, padding: 12 }}>
              <span style={{ ...s.label, color: "#ef4444" }}>Contras</span>
              {a.contras.map((c, i) => <p key={i} style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 6px", lineHeight: 1.5 }}>· {c}</p>)}
            </div>
          </div>

          <div style={{ background: "#0d1a14", border: "1px solid #1a3a28", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <span style={{ ...s.label, color: "#10b981" }}>Primer paso concreto</span>
            <p style={{ fontSize: 14, color: "#d1fae5", margin: 0, lineHeight: 1.6 }}>{a.primer_paso}</p>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ ...s.statCard, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#e8e6e1" }}>{a.tiempo_lanzamiento}</p>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Para lanzar</p>
            </div>
            <div style={{ ...s.statCard, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#10b981" }}>{a.precio_estimado}</p>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Precio</p>
            </div>
            <div style={{ ...s.statCard, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 2px", color: "#f59e0b" }}>{a.clientes_meta}</p>
              <p style={{ fontSize: 11, color: "#555", margin: 0 }}>Clientes meta</p>
            </div>
          </div>

          <button
            onClick={() => { setIdeas((prev) => prev.filter((i) => i.id !== ideaDetalle.id)); setScreen("home"); }}
            style={{ ...s.btn, ...s.btnDanger }}
          >
            Eliminar idea
          </button>
        </div>
      </div>
    );
  }

  return null;
}
