import { useState, useEffect, useCallback, useRef } from "react";

const CONTENT_TYPES = {
  video: {
    label: "Video",
    icon: "▶",
    color: "#FF4D4D",
    fields: [
      { key: "duracion", label: "Duración estimada", type: "select", options: ["15s", "30s", "60s", "2-3 min", "5+ min"] },
      { key: "formato", label: "Formato", type: "select", options: ["Horizontal 16:9", "Vertical 9:16", "Cuadrado 1:1"] },
      { key: "guion", label: "¿Requiere guión?", type: "select", options: ["Sí, completo", "Solo puntos clave", "Improvisado/Natural", "Voz en off"] },
      { key: "locacion", label: "Locación", type: "text", placeholder: "Estudio, exterior, cliente..." },
      { key: "talento", label: "Talento en cámara", type: "text", placeholder: "Nombre del presentador / actores" },
      { key: "broll", label: "B-Roll necesario", type: "textarea", placeholder: "Describe las tomas de apoyo necesarias..." },
      { key: "musica", label: "Música / Audio", type: "text", placeholder: "Tipo de música o referencia..." },
      { key: "subtitulos", label: "Subtítulos", type: "select", options: ["Sí, en español", "Sí, bilingüe", "No", "Opcionales"] },
    ]
  },
  reel: {
    label: "Reel",
    icon: "⚡",
    color: "#FF6B35",
    fields: [
      { key: "duracion", label: "Duración", type: "select", options: ["7-15s", "15-30s", "30-60s", "60-90s"] },
      { key: "gancho", label: "Gancho inicial (primeros 3s)", type: "textarea", placeholder: "¿Cómo captura atención inmediata?" },
      { key: "tendencia", label: "Tendencia o audio viral", type: "text", placeholder: "Audio de tendencia / efecto..." },
      { key: "transiciones", label: "Tipo de transiciones", type: "select", options: ["Corte directo", "Transición con movimiento", "Transición de color", "Zoom rápido", "Match cut"] },
      { key: "texto_overlay", label: "Texto superpuesto", type: "textarea", placeholder: "Captions, títulos, llamadas de atención..." },
      { key: "hashtags", label: "Estrategia de hashtags", type: "textarea", placeholder: "Hashtags principales y secundarios..." },
    ]
  },
  post: {
    label: "Post / Foto",
    icon: "◼",
    color: "#4D79FF",
    fields: [
      { key: "formato", label: "Formato visual", type: "select", options: ["Cuadrado 1:1", "Vertical 4:5", "Horizontal 1.91:1"] },
      { key: "tipo_imagen", label: "Tipo de imagen", type: "select", options: ["Fotografía original", "Diseño gráfico", "Foto + diseño", "Infografía"] },
      { key: "copy_caption", label: "Longitud del copy", type: "select", options: ["Corto (hasta 150 chars)", "Medio (150-300 chars)", "Largo / storytelling"] },
      { key: "mensaje_principal", label: "Mensaje principal", type: "textarea", placeholder: "¿Qué quiere comunicar este post?" },
      { key: "tono", label: "Tono de voz", type: "select", options: ["Informativo", "Inspiracional", "Divertido", "Emocional", "Venta directa", "Educativo"] },
      { key: "referencias", label: "Referencias visuales", type: "text", placeholder: "Paleta, estilo, mood board..." },
      { key: "hashtags", label: "Hashtags", type: "textarea", placeholder: "Hasta 30 hashtags relevantes..." },
    ]
  },
  carrusel: {
    label: "Carrusel",
    icon: "◧",
    color: "#9B59B6",
    fields: [
      { key: "num_slides", label: "Número de slides", type: "select", options: ["3-5 slides", "6-8 slides", "9-10 slides (máximo)"] },
      { key: "objetivo", label: "Objetivo del carrusel", type: "select", options: ["Educar / Tutorial", "Contar historia", "Mostrar producto", "Testimonios", "Antes y después", "Lista / Tips"] },
      { key: "slide1", label: "Slide 1 – Portada (gancho)", type: "textarea", placeholder: "Título impactante que invite a deslizar..." },
      { key: "estructura", label: "Estructura de slides", type: "textarea", placeholder: "Slide 2: ... Slide 3: ... Slide final: CTA" },
      { key: "consistencia", label: "Diseño / Consistencia visual", type: "text", placeholder: "Paleta, tipografía, estilo coherente..." },
      { key: "ultimo_slide", label: "Último slide (CTA visual)", type: "textarea", placeholder: "¿Qué acción tomar? Guardar, compartir, seguir..." },
      { key: "hashtags", label: "Hashtags", type: "text", placeholder: "Hashtags del sector..." },
    ]
  },
  historia: {
    label: "Historia / Story",
    icon: "⬛",
    color: "#1ABC9C",
    fields: [
      { key: "tipo", label: "Tipo de historia", type: "select", options: ["Imagen estática", "Video (hasta 15s)", "Boomerang", "Encuesta / Quiz", "Pregunta abierta", "Cuenta regresiva"] },
      { key: "duracion_dias", label: "¿Cuántos días activa?", type: "select", options: ["24 horas (normal)", "Destacar permanente"] },
      { key: "interaccion", label: "Elemento de interacción", type: "select", options: ["Ninguno", "Encuesta", "Quiz", "Slider emoji", "Pregunta abierta", "Link externo"] },
      { key: "mensaje", label: "Mensaje / Contenido", type: "textarea", placeholder: "¿Qué comunica esta historia?" },
      { key: "link", label: "Link / Destino", type: "text", placeholder: "URL de destino si aplica..." },
      { key: "urgencia", label: "¿Genera urgencia?", type: "select", options: ["Sí (oferta, evento, fecha límite)", "No", "Recordatorio de post reciente"] },
    ]
  }
};

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "Twitter/X"];
const OBJECTIVES = ["Awareness / Branding", "Engagement", "Conversión / Ventas", "Educación", "Entretenimiento", "Fidelización"];

let nextId = 1;

function createCard(brandName) {
  return {
    id: nextId++,
    refName: "",
    brand: brandName || "",
    platform: "",
    platforms: [],
    platformOtros: "",
    contentType: "",
    objective: "",
    publishDate: "",
    responsible: "",
    status: "pendiente",
    notes: "",
    customFields: {}
  };
}

function StatusBadge({ status, onChange }) {
  const statuses = {
    pendiente: { label: "Pendiente", bg: "#2a2a2a", color: "#888" },
    produccion: { label: "En producción", bg: "#1a2a1a", color: "#4CAF50" },
    edicion: { label: "En edición", bg: "#1a1a2a", color: "#4D79FF" },
    revision: { label: "En revisión", bg: "#2a2a1a", color: "#FFC107" },
    aprobado: { label: "Aprobado", bg: "#1a2a1a", color: "#00E676" },
    publicado: { label: "Publicado ✓", bg: "#0a1a0a", color: "#69F0AE" },
  };
  const s = statuses[status];
  return (
    <select
      value={status}
      onChange={e => onChange(e.target.value)}
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}40`,
        borderRadius: "20px",
        padding: "4px 12px",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.05em",
        cursor: "pointer",
        fontFamily: "inherit"
      }}
    >
      {Object.entries(statuses).map(([k, v]) => (
        <option key={k} value={k}>{v.label}</option>
      ))}
    </select>
  );
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function Section({ label, color, children }) {

  return (
    <div style={{ border: "1px solid #1a1a1a", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ background: "#0a0a0a", padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: color, flexShrink: 0 }} />
        <span style={{ fontSize: "10px", fontWeight: "700", color: "#555", letterSpacing: "0.12em" }}>{label}</span>
      </div>
      <div style={{ padding: "16px", background: "#0d0d0d" }}>{children}</div>
    </div>
  );
}

// ─── INLINE STATUS SELECTOR ───────────────────────────────────────────────────
function StatusBadgeInline({ status, onChange }) {
  const statuses = {
    pendiente: { label: "Pendiente", color: "#888" },
    produccion: { label: "En producción", color: "#4CAF50" },
    edicion: { label: "En edición", color: "#4D79FF" },
    revision: { label: "En revisión", color: "#FFC107" },
    aprobado: { label: "Aprobado", color: "#00E676" },
    publicado: { label: "Publicado ✓", color: "#69F0AE" },
  };

  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {Object.entries(statuses).map(([k, v]) => (
        <div key={k} onClick={() => onChange(k)} style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "5px 10px", borderRadius: "20px", cursor: "pointer",
          background: status === k ? v.color + "20" : "#1a1a1a",
          border: `1px solid ${status === k ? v.color : "#2a2a2a"}`,
          transition: "all 0.12s"
        }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: status === k ? v.color : "#333" }} />
          <span style={{ fontSize: "10px", fontWeight: "700", color: status === k ? v.color : "#444" }}>{v.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CONTENT DRAWER ───────────────────────────────────────────────────────────
function ContentDrawer({ card, brands, users, onUpdate, onSave, onClose }) {
  if (!card) return null;
  const ct = CONTENT_TYPES[card.contentType];
  const brandObj = brands.find(b => b.name === card.brand);
  const accentColor = brandObj ? brandObj.color : (ct ? ct.color : "#4D79FF");
  const update = (key, val) => onUpdate(card.id, key, val);
  const updateField = (key, val) => onUpdate(card.id, "customFields", { ...card.customFields, [key]: val });
  const [brandOpen, setBrandOpen] = useState(false);


  return (
    <div onClick={() => setBrandOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "stretch", justifyContent: "flex-end", background: "rgba(0,0,0,0.72)" }}>
      <div onClick={onClose} style={{ flex: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{ width: "min(680px, 96vw)", background: "#0e0e0e", borderLeft: `3px solid ${accentColor}`, display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto", boxShadow: "-20px 0 60px rgba(0,0,0,0.8)", animation: "drawerIn 0.22s ease" }}>
        <style>{`@keyframes drawerIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Sticky header */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#0e0e0e", borderBottom: `1px solid ${accentColor}20`, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {brandObj && (brandObj.logo ? (
              <img src={brandObj.logo} alt={brandObj.name} style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover", border:`2px solid ${brandObj.color}40` }} />
            ) : (
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:brandObj.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:"#000" }}>{brandObj.initials}</div>
            ))}
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: "'Space Grotesk',sans-serif", color: "#fff" }}>{card.refName || card.brand || "Nuevo contenido"}</div>
              <div style={{ fontSize: "10px", color: "#555", marginTop: "1px" }}>{ct ? `${ct.icon} ${ct.label}` : "Sin tipo"}{(card.platforms||[]).length > 0 ? ` · ${[...card.platforms, card.platformOtros?.trim()].filter(Boolean).join(", ")}` : ""}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#666", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontFamily: "inherit" }}>✕ Cerrar</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          <Section label="INFORMACIÓN BÁSICA" color={accentColor}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Nombre de referencia / proyecto</label>
                <input value={card.refName || ""} onChange={e => update("refName", e.target.value)} placeholder="Ej: Lanzamiento Verano, Campaña Día de Madres..." style={inputStyle} autoFocus />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Marca</label>
                <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                  <div onClick={() => setBrandOpen(!brandOpen)} style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between", background: "#1a1a1a", border: `1.5px solid ${brandObj ? brandObj.color : "#2a2a2a"}`, borderRadius: "8px", padding: "10px 14px", cursor: "pointer", minHeight: "44px" }}>
                    {brandObj ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: brandObj.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800", color: "#000" }}>{brandObj.initials}</div>
                        <div><div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{brandObj.name}</div><div style={{ fontSize: "9px", color: brandObj.color }}>{brandObj.color}</div></div>
                      </div>
                    ) : <span style={{ fontSize: "13px", color: "#444" }}>Seleccionar marca...</span>}
                    <span style={{ color: "#555", fontSize: "11px" }}>▼</span>
                  </div>
                  {brandOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#161616", border: "1px solid #2a2a2a", borderRadius: "10px", zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", overflow: "hidden" }}>
                      {brands.length === 0 && <div style={{ padding: "12px 14px", fontSize: "11px", color: "#444" }}>Sin marcas — agrégalas arriba</div>}
                      {brands.map(b => (
                        <div key={b.name} onClick={() => { update("brand", b.name); setBrandOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", cursor: "pointer", background: card.brand === b.name ? b.color + "15" : "transparent", borderLeft: card.brand === b.name ? `2px solid ${b.color}` : "2px solid transparent" }} onMouseEnter={e => e.currentTarget.style.background = b.color + "10"} onMouseLeave={e => e.currentTarget.style.background = card.brand === b.name ? b.color + "15" : "transparent"}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: b.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800", color: "#000", flexShrink: 0 }}>{b.initials}</div>
                          <div><div style={{ fontSize: "12px", fontWeight: "700", color: "#ddd" }}>{b.name}</div><div style={{ fontSize: "9px", color: b.color }}>{b.color}</div></div>
                          {card.brand === b.name && <span style={{ marginLeft: "auto", color: b.color }}>✓</span>}
                        </div>
                      ))}
                      <div onClick={() => { update("brand", ""); setBrandOpen(false); }} style={{ padding: "8px 14px", fontSize: "11px", color: "#444", cursor: "pointer", borderTop: "1px solid #1e1e1e" }}>Sin marca</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Plataforma</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  {["Instagram", "TikTok", "YouTube", "Facebook", "LinkedIn", "Twitter/X"].map(p => {
                    const checked = (card.platforms || []).includes(p);
                    return (
                      <div
                        key={p}
                        onClick={() => {
                          const current = card.platforms || [];
                          update("platforms", checked ? current.filter(x => x !== p) : [...current, p]);
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: "7px",
                          padding: "7px 12px", borderRadius: "8px", cursor: "pointer",
                          userSelect: "none", transition: "all 0.15s",
                          background: checked ? accentColor + "18" : "#1a1a1a",
                          border: `1.5px solid ${checked ? accentColor : "#2a2a2a"}`
                        }}
                      >
                        <div style={{
                          width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                          background: checked ? accentColor : "#222",
                          border: `1.5px solid ${checked ? accentColor : "#333"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", color: "#000", fontWeight: "800", transition: "all 0.15s"
                        }}>{checked ? "✓" : ""}</div>
                        <span style={{ fontSize: "12px", color: checked ? "#e0e0e0" : "#555", fontWeight: checked ? "700" : "400" }}>{p}</span>
                      </div>
                    );
                  })}

                  {/* Otros — expandible */}
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", flex: card.platformOtros ? "1 1 200px" : "0 0 auto", minWidth: 0, transition: "flex 0.3s" }}>
                    <div
                      onClick={() => {
                        if (card.platformOtros) {
                          update("platformOtros", "");
                        } else {
                          update("platformOtros", " ");
                        }
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "7px",
                        padding: "7px 12px", borderRadius: "8px", cursor: "pointer",
                        userSelect: "none", transition: "all 0.15s", flexShrink: 0,
                        background: card.platformOtros?.trim() ? accentColor + "18" : "#1a1a1a",
                        border: `1.5px solid ${card.platformOtros?.trim() ? accentColor : "#2a2a2a"}`
                      }}
                    >
                      <div style={{
                        width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                        background: card.platformOtros?.trim() ? accentColor : "#222",
                        border: `1.5px solid ${card.platformOtros?.trim() ? accentColor : "#333"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", color: "#000", fontWeight: "800"
                      }}>{card.platformOtros?.trim() ? "✓" : ""}</div>
                      <span style={{ fontSize: "12px", color: card.platformOtros?.trim() ? "#e0e0e0" : "#555", fontWeight: card.platformOtros?.trim() ? "700" : "400" }}>Otros</span>
                    </div>
                    {card.platformOtros !== undefined && card.platformOtros !== "" && (
                      <input
                        value={card.platformOtros === " " ? "" : card.platformOtros}
                        onChange={e => update("platformOtros", e.target.value)}
                        placeholder="¿Cuál?"
                        autoFocus
                        style={{
                          ...inputStyle,
                          flex: 1,
                          minWidth: "100px",
                          fontSize: "12px",
                          padding: "7px 12px",
                          border: `1.5px solid ${accentColor}60`,
                          background: "#1a1a1a"
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Objetivo</label>
                <select value={card.objective || ""} onChange={e => update("objective", e.target.value)} style={selectStyle}>
                  <option value="">Seleccionar objetivo...</option>
                  {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Responsable</label>
                <input value={card.responsible || ""} onChange={e => update("responsible", e.target.value)} placeholder="¿Quién ejecuta?" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Estado</label>
                <StatusBadgeInline status={card.status} onChange={val => update("status", val)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Fecha de publicación</label>
                <input type="date" value={card.publishDate} onChange={e => update("publishDate", e.target.value)} style={{ ...inputStyle, colorScheme: "dark", maxWidth: "200px" }} />
              </div>
            </div>
          </Section>

          <Section label="TIPO DE CONTENIDO" color={accentColor}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: ct ? "16px" : "0" }}>
              {Object.entries(CONTENT_TYPES).map(([key, val]) => (
                <button key={key} onClick={() => update("contentType", key)} style={{ background: card.contentType === key ? val.color + "22" : "#1a1a1a", color: card.contentType === key ? val.color : "#555", border: `1.5px solid ${card.contentType === key ? val.color : "#2a2a2a"}`, borderRadius: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>{val.icon} {val.label}</button>
              ))}
            </div>
            {ct && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "4px" }}>
                {ct.fields.map(f => (
                  <div key={f.key} style={f.type === "textarea" ? { gridColumn: "1 / -1" } : {}}>
                    <label style={labelStyle}>{f.label}</label>
                    {f.type === "select" ? (
                      <select value={card.customFields[f.key] || ""} onChange={e => updateField(f.key, e.target.value)} style={selectStyle}><option value="">Seleccionar...</option>{f.options.map(o => <option key={o} value={o}>{o}</option>)}</select>
                    ) : f.type === "textarea" ? (
                      <textarea value={card.customFields[f.key] || ""} onChange={e => updateField(f.key, e.target.value)} placeholder={f.placeholder} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
                    ) : (
                      <input value={card.customFields[f.key] || ""} onChange={e => updateField(f.key, e.target.value)} placeholder={f.placeholder} style={inputStyle} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section label="⚙ EQUIPO TÉCNICO" color="#888">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginBottom: "12px" }}>
              {[{key:"gear_camara_video",icon:"🎬",label:"Cámara Video"},{key:"gear_camara_foto",icon:"📷",label:"Cámara Foto"},{key:"gear_microfono",icon:"🎙",label:"Micrófono"},{key:"gear_luces",icon:"💡",label:"Luces"},{key:"gear_tripie",icon:"📐",label:"Tripié"},{key:"gear_caja_luz",icon:"🔳",label:"Caja de luz"}].map(item => {
                const checked = card[item.key] || false;
                return (
                  <div key={item.key} onClick={() => update(item.key, !checked)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer", userSelect: "none", transition: "all 0.15s", background: checked ? "#1a2a1a" : "#1a1a1a", border: `1px solid ${checked ? "#2a4a2a" : "#2a2a2a"}` }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0, background: checked ? "#4CAF50" : "#222", border: `1.5px solid ${checked ? "#4CAF50" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>{checked ? "✓" : ""}</div>
                    <span style={{ fontSize: "11px", color: checked ? "#bbb" : "#555", fontWeight: "700" }}>{item.icon} {item.label}</span>
                  </div>
                );
              })}
            </div>
            <label style={labelStyle}>Notas de equipo</label>
            <input value={card.gearNotes || ""} onChange={e => update("gearNotes", e.target.value)} placeholder="Lentes específicos, accesorios, configuración..." style={inputStyle} />
          </Section>

          <Section label="🔗 INSPIRACIÓN" color="#7B9FF5">
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input value={card.inspoLink || ""} onChange={e => update("inspoLink", e.target.value)} placeholder="https://... referencia, ejemplo, video de inspiración" style={{ ...inputStyle, flex: 1 }} />
              {card.inspoLink && <a href={card.inspoLink} target="_blank" rel="noreferrer" style={{ background: "#1a1a2e", color: "#7B9FF5", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "8px 14px", fontSize: "11px", fontWeight: "700", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>↗ Ver</a>}
            </div>
            <label style={labelStyle}>¿Qué elemento te inspira?</label>
            <input value={card.inspoDesc || ""} onChange={e => update("inspoDesc", e.target.value)} placeholder="Describe el elemento específico..." style={inputStyle} />
          </Section>

          <Section label="✍ CAPTION" color="#F0C040">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Texto del caption</label>
                <textarea value={card.captionText || ""} onChange={e => update("captionText", e.target.value)} placeholder="Escribe aquí el caption completo..." rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                <div style={{ textAlign: "right", fontSize: "10px", color: "#333", marginTop: "4px" }}>{(card.captionText || "").length} caracteres</div>
              </div>
              <div>
                <label style={labelStyle}>Tono</label>
                <select value={card.captionTone || ""} onChange={e => update("captionTone", e.target.value)} style={selectStyle}><option value="">Seleccionar...</option>{["Informativo","Inspiracional","Divertido / Casual","Emocional","Venta directa","Educativo","Storytelling","Pregunta / Conversacional"].map(t=><option key={t} value={t}>{t}</option>)}</select>
              </div>
              <div>
                <label style={labelStyle}>Emojis</label>
                <select value={card.captionEmojis || ""} onChange={e => update("captionEmojis", e.target.value)} style={selectStyle}><option value="">Seleccionar...</option>{["Sí, abundante","Sí, moderado","Solo al inicio / final","No"].map(o=><option key={o} value={o}>{o}</option>)}</select>
              </div>
              <div>
                <label style={labelStyle}>Primera línea / Gancho</label>
                <input value={card.captionHook || ""} onChange={e => update("captionHook", e.target.value)} placeholder="Frase que detiene el scroll..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Aprobación del cliente</label>
                <select value={card.captionApproval || ""} onChange={e => update("captionApproval", e.target.value)} style={selectStyle}><option value="">Seleccionar...</option>{["Sí, antes de publicar","No, uso directo","Solo revisión rápida"].map(o=><option key={o} value={o}>{o}</option>)}</select>
              </div>
              <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #1a1a1a", paddingTop: "12px" }}>
                <label style={{ ...labelStyle, color: "#F0C040" }}>Call to Action</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>Tipo de CTA</label>
                    <select value={card.captionCtaType || ""} onChange={e => update("captionCtaType", e.target.value)} style={selectStyle}><option value="">Seleccionar...</option>{["Guardar esta publicación","Comparte con alguien","Comenta tu opinión","Visita el link en bio","Sigue la cuenta","Manda DM","Responde esta pregunta","Etiqueta a alguien"].map(o=><option key={o} value={o}>{o}</option>)}</select>
                  </div>
                  <div>
                    <label style={labelStyle}>CTA personalizado</label>
                    <input value={card.captionCta || ""} onChange={e => update("captionCta", e.target.value)} placeholder="Texto libre del CTA..." style={inputStyle} />
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Hashtags</label>
                <textarea value={card.captionHashtags || ""} onChange={e => update("captionHashtags", e.target.value)} placeholder="#marca #sector #tendencia..." rows={2} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
              </div>
            </div>
          </Section>

          <Section label="👥 FASES Y RESPONSABLES" color="#9B59B6">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { key: "phase_plan",   icon: "💡", label: "Planeación", desc: "Quien define el concepto y estrategia del contenido" },
                { key: "phase_create", icon: "🎬", label: "Creación",   desc: "Quien produce, filma o diseña el contenido" },
                { key: "phase_upload", icon: "📤", label: "Publicación", desc: "Quien sube y programa el contenido" },
              ].map(phase => {
                const phaseData = card[phase.key] || {};
                const updatePhase = (field, val) => update(phase.key, { ...phaseData, [field]: val });
                return (
                  <div key={phase.key} style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "10px", padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "14px" }}>{phase.icon}</span>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#ccc", letterSpacing: "0.04em" }}>{phase.label}</div>
                        <div style={{ fontSize: "10px", color: "#444", marginTop: "1px" }}>{phase.desc}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={labelStyle}>Responsable</label>
                        <select value={phaseData.user || ""} onChange={e => updatePhase("user", e.target.value)} style={selectStyle}>
                          <option value="">Seleccionar...</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name}{u.role ? ` — ${u.role}` : ""}</option>)}
                          <option value="__manual__">Escribir nombre...</option>
                        </select>
                        {phaseData.user === "__manual__" && (
                          <input value={phaseData.userManual || ""} onChange={e => updatePhase("userManual", e.target.value)} placeholder="Nombre del responsable..." style={{ ...inputStyle, marginTop: "6px" }} />
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Fecha inicio</label>
                        <input type="date" value={phaseData.startDate || ""} onChange={e => updatePhase("startDate", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
                      </div>
                      <div>
                        <label style={labelStyle}>Fecha fin</label>
                        <input type="date" value={phaseData.endDate || ""} min={phaseData.startDate || undefined} onChange={e => updatePhase("endDate", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section label="NOTAS ADICIONALES" color="#555">
            <textarea value={card.notes || ""} onChange={e => update("notes", e.target.value)} placeholder="Referencias, instrucciones especiales, links, observaciones del cliente..." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </Section>

        </div>

        {/* Sticky save footer */}
        <div style={{ position: "sticky", bottom: 0, background: "#0e0e0e", borderTop: `1px solid ${accentColor}30`, padding: "16px 24px", display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ background: "transparent", color: "#555", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>Cancelar</button>
          <button onClick={onSave} style={{ flex: 1, background: accentColor, color: "#000", border: "none", borderRadius: "10px", padding: "13px 20px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em", boxShadow: `0 4px 20px ${accentColor}40` }}>✓ Guardar contenido</button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPACT CARD ─────────────────────────────────────────────────────────────
function ContentCard({ card, brands, onEdit, onDelete }) {
  const ct = CONTENT_TYPES[card.contentType];
  const brandObj = brands.find(b => b.name === card.brand);
  const accentColor = brandObj ? brandObj.color : (ct ? ct.color : "#333");
  const statusColors = { pendiente:"#888", produccion:"#4CAF50", edicion:"#4D79FF", revision:"#FFC107", aprobado:"#00E676", publicado:"#69F0AE" };
  const sc = statusColors[card.status] || "#888";


  return (
    <div style={{ background: "#111", border: `1px solid ${accentColor}25`, borderLeft: `3px solid ${accentColor}`, borderRadius: "12px", marginBottom: "8px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
      {brandObj ? (
        brandObj.logo ? (
          <img src={brandObj.logo} alt={brandObj.name} style={{ width:"36px", height:"36px", borderRadius:"50%", objectFit:"cover", flexShrink:0, border:`2px solid ${brandObj.color}40` }} />
        ) : (
          <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:brandObj.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:"#000", flexShrink:0 }}>{brandObj.initials}</div>
        )
      ) : (
        <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#1a1a1a", border:"1px solid #2a2a2a", flexShrink:0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#e0e0e0", fontFamily: "'Space Grotesk',sans-serif", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{card.refName || card.brand || "Sin nombre"}</div>
        <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap", alignItems: "center" }}>
          {card.brand && <span style={{ fontSize: "10px", color: brandObj ? brandObj.color : "#555" }}>{card.brand}</span>}
          {ct && <span style={{ fontSize: "10px", color: ct.color, background: ct.color+"18", padding: "1px 7px", borderRadius: "4px", fontWeight: "700" }}>{ct.icon} {ct.label}</span>}
          {(card.platforms || []).map(p => <span key={p} style={{ fontSize: "10px", color: "#555", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "1px 6px", borderRadius: "4px" }}>{p}</span>)}
          {card.platformOtros?.trim() && <span style={{ fontSize: "10px", color: "#555", background: "#1a1a1a", border: "1px solid #2a2a2a", padding: "1px 6px", borderRadius: "4px" }}>{card.platformOtros}</span>}
          {card.publishDate && <span style={{ fontSize: "10px", color: "#444" }}>📅 {card.publishDate}</span>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: sc }} />
        <span style={{ fontSize: "10px", color: sc, fontWeight: "700", textTransform: "capitalize" }}>{card.status}</span>
      </div>
      <button onClick={() => onEdit(card.id)} style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "6px 14px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", flexShrink: 0 }}>▼ Detalles</button>
      <button onClick={() => onDelete(card.id)} style={{ background: "transparent", color: "#333", border: "none", cursor: "pointer", fontSize: "16px", padding: "4px", flexShrink: 0 }}>✕</button>
    </div>
  );
}


// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteConfirmModal({ card, brands, onConfirm, onCancel }) {
  if (!card) return null;
  const ct = CONTENT_TYPES[card.contentType];
  const brandObj = brands.find(b => b.name === card.brand);
  const accentColor = brandObj ? brandObj.color : (ct ? ct.color : "#FF4D4D");


  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #2a2a2a",
          borderTop: "3px solid #FF4D4D",
          borderRadius: "16px",
          padding: "32px 28px",
          maxWidth: "420px",
          width: "100%",
          animation: "fadeUp 0.18s ease"
        }}
      >
        <style>{`@keyframes fadeUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Icon */}
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FF4D4D18", border: "1px solid #FF4D4D40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "20px" }}>
          🗑
        </div>

        {/* Title */}
        <div style={{ fontSize: "17px", fontWeight: "700", fontFamily: "'Space Grotesk',sans-serif", color: "#fff", marginBottom: "8px" }}>
          ¿Borrar este contenido?
        </div>
        <div style={{ fontSize: "12px", color: "#555", marginBottom: "20px", lineHeight: 1.5 }}>
          Esta acción no se puede deshacer. El contenido se eliminará permanentemente.
        </div>

        {/* Card preview */}
        <div style={{
          background: "#0d0d0d",
          border: `1px solid ${accentColor}30`,
          borderLeft: `3px solid ${accentColor}`,
          borderRadius: "10px",
          padding: "12px 14px",
          marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "10px"
        }}>
          {brandObj ? (
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: brandObj.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "800", color: "#000", flexShrink: 0 }}>{brandObj.initials}</div>
          ) : (
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#1a1a1a", border: "1px solid #2a2a2a", flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#e0e0e0", fontFamily: "'Space Grotesk',sans-serif", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {card.refName || card.brand || "Sin nombre"}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "3px", alignItems: "center", flexWrap: "wrap" }}>
              {card.brand && brandObj && <span style={{ fontSize: "10px", color: brandObj.color }}>{card.brand}</span>}
              {ct && <span style={{ fontSize: "10px", color: ct.color, background: ct.color + "18", padding: "1px 7px", borderRadius: "4px", fontWeight: "700" }}>{ct.icon} {ct.label}</span>}
              {card.platform && <span style={{ fontSize: "10px", color: "#444" }}>{card.platform}</span>}
              {card.publishDate && <span style={{ fontSize: "10px", color: "#444" }}>📅 {card.publishDate}</span>}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, background: "transparent", color: "#888",
              border: "1px solid #2a2a2a", borderRadius: "10px",
              padding: "12px", fontSize: "13px", fontWeight: "600",
              cursor: "pointer", fontFamily: "inherit"
            }}
          >Cancelar</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, background: "#FF4D4D", color: "#fff",
              border: "none", borderRadius: "10px",
              padding: "12px", fontSize: "13px", fontWeight: "800",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 16px #FF4D4D40"
            }}
          >🗑 Sí, borrar</button>
        </div>
      </div>
    </div>
  );
}


// ─── LOGO UPLOADER ────────────────────────────────────────────────────────────
function LogoUploader({ value, color, initials, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };


  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* Preview circle */}
      <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: `2px solid ${color}60`, position: "relative" }}>
        {value ? (
          <img src={value} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: color }}>
            {(initials || "?").toUpperCase().slice(0, 2)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ display: "block", background: "#1a1a1a", border: `1px dashed ${value ? color + "60" : "#333"}`, borderRadius: "8px", padding: "8px 12px", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = color} onMouseLeave={e => e.currentTarget.style.borderColor = value ? color + "60" : "#333"}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <div style={{ fontSize: "11px", color: value ? color : "#555", fontWeight: "700" }}>
            {value ? "↺ Cambiar logo" : "↑ Subir logo"}
          </div>
          <div style={{ fontSize: "9px", color: "#333", marginTop: "2px" }}>PNG, JPG, SVG</div>
        </label>
        {value && (
          <button onClick={() => onChange("")} style={{ width: "100%", marginTop: "4px", background: "transparent", color: "#444", border: "none", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>
            ✕ Quitar logo
          </button>
        )}
      </div>
    </div>
  );
}

// ─── GANTT VIEW ───────────────────────────────────────────────────────────────
let userNextId = 1;

function GanttView({ cards, brands, users, onEdit }) {
  const PHASES = [
    { key: "phase_plan",   label: "Planeación",  color: "#9B59B6" },
    { key: "phase_create", label: "Creación",     color: "#FF6B35" },
    { key: "phase_upload", label: "Publicación",  color: "#1ABC9C" },
  ];

  const [filterBrand, setFilterBrand] = useState("all");
  const [filterUser, setFilterUser]   = useState("all");

  const getUserName = (userId) => {
    if (!userId || userId === "__manual__") return null;
    const u = users.find(u => u.id === userId);
    return u ? u.name : null;
  };

  // Collect all phase rows with at least a start date
  const allRows = [];
  cards.forEach(card => {
    PHASES.forEach(phase => {
      const p = card[phase.key];
      if (p?.startDate) {
        const resolvedUser = p.user === "__manual__" ? (p.userManual || null) : getUserName(p.user);
        allRows.push({ card, phase, data: p, resolvedUser, userId: p.user });
      }
    });
  });

  // Apply filters
  const rows = allRows.filter(r => {
    if (filterBrand !== "all" && r.card.brand !== filterBrand) return false;
    if (filterUser !== "all") {
      if (filterUser === "__manual__") {
        if (r.userId !== "__manual__") return false;
      } else {
        if (r.userId !== filterUser) return false;
      }
    }
    return true;
  });

  // Users that actually have phases
  const activeUserIds = [...new Set(allRows.map(r => r.userId).filter(Boolean))];
  const activeUsers = users.filter(u => activeUserIds.includes(u.id));
  const hasManual = allRows.some(r => r.userId === "__manual__");

  if (allRows.length === 0) return (
    <div style={{ textAlign:"center", padding:"80px 20px", color:"#333" }}>
      <div style={{ fontSize:"32px", marginBottom:"12px" }}>◧</div>
      <div style={{ fontSize:"13px", letterSpacing:"0.1em" }}>SIN FASES CON FECHAS AÚN</div>
      <div style={{ fontSize:"11px", color:"#2a2a2a", marginTop:"6px" }}>Agrega fechas de inicio a las fases desde el editor de contenido</div>
    </div>
  );

  // Timeline range from ALL rows (not filtered) so axis stays stable
  const allDates = allRows.flatMap(r => [r.data.startDate, r.data.endDate].filter(Boolean));
  const minDate = new Date(allDates.reduce((a,b) => a<b?a:b));
  const maxDate = new Date(allDates.reduce((a,b) => a>b?a:b));
  maxDate.setDate(maxDate.getDate() + 2);
  minDate.setDate(minDate.getDate() - 1);
  const totalDays = Math.max((maxDate - minDate) / 86400000, 1);

  const dayPct = (dateStr) => {
    if (!dateStr) return null;
    return ((new Date(dateStr) - minDate) / 86400000) / totalDays * 100;
  };

  const today = new Date();
  const todayPct = ((today - minDate) / 86400000) / totalDays * 100;

  const dayLabels = [];
  const cursor = new Date(minDate);
  while (cursor <= maxDate) { dayLabels.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); }

  const chipStyle = (active, color="#fff") => ({
    display:"flex", alignItems:"center", gap:"6px",
    padding:"5px 12px", borderRadius:"20px", cursor:"pointer",
    userSelect:"none", transition:"all 0.15s",
    background: active ? color+"22" : "#111",
    border:`1.5px solid ${active ? color : "#222"}`,
    fontSize:"11px", fontWeight: active?"700":"500",
    color: active ? color : "#666"
  });


  return (
    <div>
      {/* ── Filters bar ── */}
      <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"12px", padding:"14px 18px", marginBottom:"20px", display:"flex", flexDirection:"column", gap:"12px" }}>

        {/* Brand filter */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:"10px", color:"#444", letterSpacing:"0.12em", fontWeight:"700", minWidth:"60px" }}>MARCA:</span>
          <div onClick={()=>setFilterBrand("all")} style={chipStyle(filterBrand==="all")}>Todas</div>
          {brands.map(b => (
            <div key={b.name} onClick={()=>setFilterBrand(filterBrand===b.name?"all":b.name)} style={chipStyle(filterBrand===b.name, b.color)}>
              {b.logo
                ? <img src={b.logo} alt={b.name} style={{ width:"14px", height:"14px", borderRadius:"50%", objectFit:"cover" }} />
                : <div style={{ width:"14px", height:"14px", borderRadius:"50%", background:b.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"7px", fontWeight:"800", color:"#000" }}>{b.initials}</div>
              }
              {b.name}
            </div>
          ))}
        </div>

        {/* User filter */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:"10px", color:"#444", letterSpacing:"0.12em", fontWeight:"700", minWidth:"60px" }}>USUARIO:</span>
          <div onClick={()=>setFilterUser("all")} style={chipStyle(filterUser==="all")}>Todos</div>
          {activeUsers.map(u => (
            <div key={u.id} onClick={()=>setFilterUser(filterUser===u.id?"all":u.id)} style={chipStyle(filterUser===u.id, "#9B59B6")}>
              <div style={{ width:"16px", height:"16px", borderRadius:"50%", background: filterUser===u.id?"#9B59B6":"#2a2a2a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"7px", fontWeight:"800", color: filterUser===u.id?"#000":"#888" }}>
                {u.name.slice(0,1)}{u.name.split(" ")[1]?.slice(0,1)||""}
              </div>
              {u.name}
            </div>
          ))}
          {hasManual && (
            <div onClick={()=>setFilterUser(filterUser==="__manual__"?"all":"__manual__")} style={chipStyle(filterUser==="__manual__", "#888")}>
              Manual
            </div>
          )}
        </div>

      </div>

      {/* ── Result count ── */}
      <div style={{ fontSize:"10px", color:"#444", letterSpacing:"0.12em", fontWeight:"700", marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
        DIAGRAMA DE GANTT — {rows.length} FASE{rows.length!==1?"S":""} MOSTRADA{rows.length!==1?"S":""}
        {(filterBrand!=="all" || filterUser!=="all") && (
          <span onClick={()=>{setFilterBrand("all");setFilterUser("all");}} style={{ color:"#FF4D4D", cursor:"pointer", fontWeight:"700", fontSize:"10px", border:"1px solid #FF4D4D30", borderRadius:"6px", padding:"2px 8px" }}>✕ Limpiar filtros</span>
        )}
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#333", fontSize:"12px", letterSpacing:"0.08em" }}>
          SIN RESULTADOS PARA ESTE FILTRO
        </div>
      ) : (
        <>
          {/* ── Gantt table ── */}
          <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"12px", overflow:"hidden" }}>
            {/* Date axis header */}
            <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", borderBottom:"1px solid #1a1a1a" }}>
              <div style={{ padding:"10px 16px", fontSize:"10px", color:"#444", fontWeight:"700", letterSpacing:"0.1em", borderRight:"1px solid #1a1a1a" }}>CONTENIDO / FASE</div>
              <div style={{ position:"relative", height:"36px", overflow:"hidden" }}>
                {dayLabels.filter((_,i) => i % Math.ceil(totalDays/20) === 0).map((d,i) => (
                  <div key={i} style={{ position:"absolute", left:`${((d-minDate)/86400000)/totalDays*100}%`, top:0, fontSize:"9px", color:"#444", paddingTop:"10px", whiteSpace:"nowrap", transform:"translateX(-50%)" }}>
                    {d.getDate()}/{d.getMonth()+1}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => {
              const bo = brands.find(b => b.name === row.card.brand);
              const left  = dayPct(row.data.startDate);
              const right = row.data.endDate ? dayPct(row.data.endDate) : left + 2;
              const width = Math.max(right - left, 0.5);
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"220px 1fr", borderBottom:"1px solid #141414", minHeight:"46px" }}>
                  {/* Label column */}
                  <div style={{ padding:"8px 16px", borderRight:"1px solid #141414", display:"flex", alignItems:"center", gap:"8px" }}>
                    {bo?.logo
                      ? <img src={bo.logo} alt={bo.name} style={{ width:"14px", height:"14px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                      : <div style={{ width:"8px", height:"8px", borderRadius:"50%", background: bo ? bo.color : row.phase.color, flexShrink:0 }} />
                    }
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:"11px", fontWeight:"700", color:"#ccc", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                        {row.card.refName || row.card.brand || "Sin nombre"}
                      </div>
                      <div style={{ fontSize:"9px", color:"#444", marginTop:"1px" }}>
                        {row.phase.label}
                        {row.resolvedUser && <span style={{ color:"#555" }}> · {row.resolvedUser}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Bar column */}
                  <div style={{ position:"relative", background: i%2===0 ? "transparent" : "#080808" }}>
                    {todayPct >= 0 && todayPct <= 100 && (
                      <div style={{ position:"absolute", left:`${todayPct}%`, top:0, bottom:0, width:"1px", background:"#FF4D4D50", zIndex:1 }} />
                    )}
                    <div
                      onClick={() => onEdit(row.card.id)}
                      title={`${row.data.startDate}${row.data.endDate ? ` → ${row.data.endDate}` : ""}${row.resolvedUser ? ` · ${row.resolvedUser}` : ""}`}
                      style={{
                        position:"absolute", left:`${left}%`, width:`${width}%`,
                        top:"50%", transform:"translateY(-50%)",
                        height:"22px", borderRadius:"6px",
                        background: row.phase.color+"28", border:`1.5px solid ${row.phase.color}`,
                        cursor:"pointer", zIndex:2,
                        display:"flex", alignItems:"center", gap:"5px", paddingLeft:"6px", overflow:"hidden"
                      }}
                    >
                      <span style={{ fontSize:"9px", color:row.phase.color, fontWeight:"700", whiteSpace:"nowrap" }}>
                        {row.phase.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display:"flex", gap:"16px", marginTop:"12px", flexWrap:"wrap", alignItems:"center" }}>
            {PHASES.map(p => (
              <div key={p.key} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                <div style={{ width:"20px", height:"6px", borderRadius:"3px", background:p.color }} />
                <span style={{ fontSize:"10px", color:"#555" }}>{p.label}</span>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <div style={{ width:"1px", height:"14px", background:"#FF4D4D" }} />
              <span style={{ fontSize:"10px", color:"#555" }}>Hoy</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── USERS VIEW ───────────────────────────────────────────────────────────────
const USER_ROLES = ["Director Creativo","Videógrafo","Fotógrafo","Editor","Community Manager","Diseñador","Estratega","Cliente","Otro"];

function UsersView({ users, setUsers }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:"", role:"", email:"", phone:"", notes:"" });
  const [deletingId, setDeletingId] = useState(null);

  const openNew = () => { setForm({ name:"", role:"", email:"", phone:"", notes:"" }); setEditId(null); setShowForm(true); };
  const openEdit = (u) => { setForm({ name:u.name, role:u.role||"", email:u.email||"", phone:u.phone||"", notes:u.notes||"" }); setEditId(u.id); setShowForm(true); };
  const saveUser = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setUsers(users.map(u => u.id === editId ? { ...u, ...form } : u));
    } else {
      setUsers([...users, { id: `u${userNextId++}_${Date.now()}`, ...form }]);
    }
    setShowForm(false);
  };
  const deleteUser = (id) => { setUsers(users.filter(u => u.id !== id)); setDeletingId(null); };


  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <div style={{ fontSize:"10px", color:"#444", letterSpacing:"0.12em", fontWeight:"700" }}>
          EQUIPO — {users.length} USUARIO{users.length !== 1 ? "S" : ""}
        </div>
        <button onClick={openNew} style={{ background:"#fff", color:"#000", border:"none", borderRadius:"8px", padding:"7px 18px", fontSize:"11px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit" }}>+ Nuevo usuario</button>
      </div>

      {users.length === 0 && !showForm && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#333" }}>
          <div style={{ fontSize:"32px", marginBottom:"12px" }}>◉</div>
          <div style={{ fontSize:"13px", letterSpacing:"0.1em" }}>SIN USUARIOS AÚN</div>
          <div style={{ fontSize:"11px", color:"#2a2a2a", marginTop:"6px" }}>Agrega los miembros del equipo para asignarlos a las fases</div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"10px", marginBottom: showForm ? "20px" : "0" }}>
        {users.map(u => (
          <div key={u.id} style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"12px", padding:"16px" }}>
            {deletingId === u.id ? (
              <div>
                <div style={{ fontSize:"11px", color:"#FF4D4D", marginBottom:"10px", fontWeight:"700" }}>¿Eliminar a {u.name}?</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <button onClick={()=>setDeletingId(null)} style={{ flex:1, background:"transparent", color:"#555", border:"1px solid #2a2a2a", borderRadius:"6px", padding:"6px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
                  <button onClick={()=>deleteUser(u.id)} style={{ flex:1, background:"#FF4D4D", color:"#fff", border:"none", borderRadius:"6px", padding:"6px", fontSize:"11px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit" }}>Eliminar</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#1a1a1a", border:"1px solid #2a2a2a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"800", color:"#888" }}>
                      {u.name.slice(0,1).toUpperCase()}{u.name.split(" ")[1]?.slice(0,1).toUpperCase()||""}
                    </div>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:"700", color:"#e0e0e0", fontFamily:"'Space Grotesk',sans-serif" }}>{u.name}</div>
                      {u.role && <div style={{ fontSize:"10px", color:"#9B59B6", marginTop:"1px", fontWeight:"700" }}>{u.role}</div>}
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button onClick={()=>openEdit(u)} style={{ background:"#1a1a1a", color:"#666", border:"1px solid #222", borderRadius:"6px", padding:"4px 10px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit" }}>✏</button>
                    <button onClick={()=>setDeletingId(u.id)} style={{ background:"transparent", color:"#333", border:"1px solid #1a1a1a", borderRadius:"6px", padding:"4px 8px", fontSize:"12px", cursor:"pointer" }}>🗑</button>
                  </div>
                </div>
                {(u.email || u.phone) && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"3px", paddingTop:"10px", borderTop:"1px solid #1a1a1a" }}>
                    {u.email && <div style={{ fontSize:"11px", color:"#555" }}>✉ {u.email}</div>}
                    {u.phone && <div style={{ fontSize:"11px", color:"#555" }}>📱 {u.phone}</div>}
                  </div>
                )}
                {u.notes && <div style={{ fontSize:"11px", color:"#444", marginTop:"8px", lineHeight:1.5 }}>{u.notes}</div>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:"#0d0d0d", border:"1px solid #2a2a2a", borderRadius:"14px", padding:"24px", maxWidth:"500px" }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"14px", fontWeight:"700", color:"#fff", marginBottom:"18px" }}>
            {editId ? "Editar usuario" : "Nuevo usuario"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>Nombre completo *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nombre Apellido" style={inputStyle} autoFocus />
            </div>
            <div>
              <label style={labelStyle}>Puesto / Rol</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={selectStyle}>
                <option value="">Seleccionar...</option>
                {USER_ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="correo@ejemplo.com" type="email" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+52 000 000 0000" style={inputStyle} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>Notas</label>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Especialidad, disponibilidad, observaciones..." rows={2} style={{ ...inputStyle, resize:"vertical", lineHeight:1.5 }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:"10px", marginTop:"18px" }}>
            <button onClick={()=>setShowForm(false)} style={{ flex:1, background:"transparent", color:"#555", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
            <button onClick={saveUser} style={{ flex:2, background:"#9B59B6", color:"#fff", border:"none", borderRadius:"8px", padding:"10px", fontSize:"12px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit" }}>
              {editId ? "✓ Guardar cambios" : "+ Agregar usuario"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  background:"#1a1a1a", color:"#888", border:"1px solid #2a2a2a",
  borderRadius:"8px", padding:"6px 14px", cursor:"pointer", fontSize:"12px", fontFamily:"inherit"
};

const DAYS_ES = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function CalendarMonthly({ cards, brands, onCardClick }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const cardsWithDate = cards.filter(c => c.publishDate);
  const getCardsForDay = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return cardsWithDate.filter(c => c.publishDate === dateStr);
  };
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <button onClick={prevMonth} style={navBtnStyle}>◀</button>
        <span style={{ fontSize:"16px", fontWeight:"700", fontFamily:"'Space Grotesk',sans-serif", color:"#fff" }}>
          {MONTHS_ES[month]} {year}
        </span>
        <button onClick={nextMonth} style={navBtnStyle}>▶</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"2px" }}>
        {DAYS_ES.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:"10px", color:"#444", fontWeight:"700", letterSpacing:"0.1em", padding:"6px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
        {Array.from({ length: totalCells }).map((_, i) => {
          const dayNum = i - startOffset + 1;
          const isValid = dayNum >= 1 && dayNum <= lastDay.getDate();
          const isToday = isValid && today.getDate()===dayNum && today.getMonth()===month && today.getFullYear()===year;
          const dayCards = isValid ? getCardsForDay(dayNum) : [];
          return (
            <div key={i} style={{
              background: isValid ? (isToday ? "#181818" : "#0f0f0f") : "transparent",
              border: isToday ? "1px solid #333" : "1px solid #141414",
              borderRadius:"8px", minHeight:"80px", padding:"6px"
            }}>
              {isValid && (
                <>
                  <div style={{ fontSize:"11px", fontWeight: isToday?"700":"400", color: isToday?"#fff":"#444", marginBottom:"4px", display:"flex", alignItems:"center", gap:"4px" }}>
                    {isToday && <span style={{ width:"5px",height:"5px",borderRadius:"50%",background:"#FF4D4D",display:"inline-block" }} />}
                    {dayNum}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
                    {dayCards.slice(0,3).map(c => {
                      const ct = CONTENT_TYPES[c.contentType];
                      const bo = brands.find(b => b.name === c.brand);
                      const chipColor = bo ? bo.color : (ct ? ct.color : "#444");
                      return (
                        <div key={c.id} onClick={() => onCardClick(c)}
                          title={`${c.refName || c.brand} · ${ct?.label||"Sin tipo"} · ${c.platform}`}
                          style={{ background: chipColor+"22", borderLeft:`2px solid ${chipColor}`, borderRadius:"3px", padding:"2px 5px", fontSize:"9px", color: chipColor, cursor:"pointer", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", fontWeight:"700", display:"flex", alignItems:"center", gap:"4px" }}>
                          {bo && <span style={{ width:"8px",height:"8px",borderRadius:"50%",background:bo.color,flexShrink:0,display:"inline-block" }} />}
                          {ct?.icon} {c.refName || c.brand||"Sin nombre"}
                        </div>
                      );
                    })}
                    {dayCards.length > 3 && <div style={{ fontSize:"9px", color:"#555", paddingLeft:"4px" }}>+{dayCards.length-3} más</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarWeekly({ cards, brands, onCardClick }) {
  const today = new Date();
  const getMonday = (d) => { const date=new Date(d); const day=date.getDay(); date.setDate(date.getDate()-((day+6)%7)); date.setHours(0,0,0,0); return date; };
  const [weekStart, setWeekStart] = useState(getMonday(today));
  const weekDays = Array.from({ length:7 }, (_,i) => { const d=new Date(weekStart); d.setDate(weekStart.getDate()+i); return d; });
  const prevWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const nextWeek = () => { const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };
  const getCardsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    return cards.filter(c => c.publishDate === dateStr);
  };
  const weekEnd = weekDays[6];
  const rangeLabel = `${weekDays[0].getDate()} ${MONTHS_ES[weekDays[0].getMonth()]} — ${weekEnd.getDate()} ${MONTHS_ES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  const statusColors = { pendiente:"#888", produccion:"#4CAF50", edicion:"#4D79FF", revision:"#FFC107", aprobado:"#00E676", publicado:"#69F0AE" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
        <button onClick={prevWeek} style={navBtnStyle}>◀</button>
        <span style={{ fontSize:"14px", fontWeight:"700", fontFamily:"'Space Grotesk',sans-serif", color:"#fff" }}>{rangeLabel}</span>
        <button onClick={nextWeek} style={navBtnStyle}>▶</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"6px" }}>
        {weekDays.map((date, i) => {
          const isToday = date.toDateString()===today.toDateString();
          const dayCards = getCardsForDate(date);
          return (
            <div key={i} style={{ background: isToday?"#141414":"#0d0d0d", border: isToday?"1px solid #2a2a2a":"1px solid #141414", borderTop: isToday?"2px solid #FF4D4D":"2px solid #1a1a1a", borderRadius:"10px", minHeight:"200px", padding:"10px 8px" }}>
              <div style={{ marginBottom:"10px", textAlign:"center" }}>
                <div style={{ fontSize:"10px", color:"#444", letterSpacing:"0.1em", fontWeight:"700" }}>{DAYS_ES[i]}</div>
                <div style={{ fontSize:"20px", fontWeight:"700", fontFamily:"'Space Grotesk',sans-serif", color: isToday?"#fff":"#555", lineHeight:1.1, marginTop:"2px" }}>{date.getDate()}</div>
                <div style={{ fontSize:"9px", color:"#333", marginTop:"1px" }}>{MONTHS_ES[date.getMonth()]}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                {dayCards.length===0 && <div style={{ height:"2px", background:"#161616", borderRadius:"2px", margin:"4px 0" }} />}
                {dayCards.map(c => {
                  const ct = CONTENT_TYPES[c.contentType];
                  const bo = brands.find(b => b.name === c.brand);
                  const chipColor = bo ? bo.color : (ct ? ct.color : "#444");
                  return (
                    <div key={c.id} onClick={() => onCardClick(c)} style={{ background: chipColor+"18", border:`1px solid ${chipColor}40`, borderRadius:"6px", padding:"6px 8px", cursor:"pointer" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
                        {bo && <div style={{ width:"14px",height:"14px",borderRadius:"50%",background:bo.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"7px",fontWeight:"800",color:"#000",flexShrink:0 }}>{bo.initials.slice(0,1)}</div>}
                        <div style={{ fontSize:"10px", color: chipColor, fontWeight:"700" }}>{ct?.icon} {ct?.label||"—"}</div>
                      </div>
                      <div style={{ fontSize:"11px", color:"#ccc", fontWeight:"600", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{c.refName || c.brand||"Sin nombre"}</div>
                      {c.refName && c.brand && <div style={{ fontSize:"9px", color:"#555", marginTop:"1px" }}>{c.brand}</div>}
                      {c.platform && <div style={{ fontSize:"9px", color:"#444", marginTop:"2px" }}>{c.platform}</div>}
                      <div style={{ marginTop:"4px", display:"flex", alignItems:"center", gap:"4px" }}>
                        <span style={{ width:"5px",height:"5px",borderRadius:"50%",background:statusColors[c.status]||"#888",display:"inline-block" }} />
                        <span style={{ fontSize:"9px", color:"#444", textTransform:"capitalize" }}>{c.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardDetailModal({ card, brands, onClose, onOpenDrawer }) {
  if (!card) return null;
  const ct = CONTENT_TYPES[card.contentType];
  const bo = brands.find(b => b.name === card.brand);
  const accentColor = bo ? bo.color : (ct ? ct.color : "#333");

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"20px" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#111", border:`1px solid ${accentColor}40`, borderTop:`3px solid ${accentColor}`, borderRadius:"14px", padding:"28px", maxWidth:"480px", width:"100%", maxHeight:"80vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            {bo && <div style={{ width:"40px",height:"40px",borderRadius:"50%",background:bo.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color:"#000",flexShrink:0 }}>{bo.initials}</div>}
            <div>
              <div style={{ fontSize:"18px", fontWeight:"700", fontFamily:"'Space Grotesk',sans-serif", color:"#fff" }}>{card.refName || card.brand||"Sin nombre"}</div>
              <div style={{ fontSize:"11px", color:"#555", marginTop:"3px" }}>{ct?.icon} {ct?.label||"Sin tipo"} · {card.platform||"Sin plataforma"}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            {onOpenDrawer && <button onClick={() => onOpenDrawer(card.id)} style={{ background:"#1a1a1a", color:"#888", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", fontSize:"11px", fontFamily:"inherit" }}>✏ Editar</button>}
            <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#555", fontSize:"20px", cursor:"pointer" }}>✕</button>
          </div>
        </div>
        {[["Nombre de referencia", card.refName],["Fecha de publicación", card.publishDate],["Objetivo", card.objective],["Responsable", card.responsible],["Estado", card.status],["Notas", card.notes]].map(([label, val]) => val ? (
          <div key={label} style={{ marginBottom:"12px" }}>
            <div style={{ fontSize:"10px", color:"#444", letterSpacing:"0.1em", fontWeight:"700", marginBottom:"3px", textTransform:"uppercase" }}>{label}</div>
            <div style={{ fontSize:"13px", color:"#ccc" }}>{val}</div>
          </div>
        ) : null)}
        {card.captionText && (
          <div style={{ marginTop:"16px", background:"#0d0d0d", border:"1px solid #1e1e1e", borderRadius:"8px", padding:"12px" }}>
            <div style={{ fontSize:"10px", color:"#F0C040", fontWeight:"700", letterSpacing:"0.1em", marginBottom:"6px" }}>✍ CAPTION</div>
            <div style={{ fontSize:"12px", color:"#aaa", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{card.captionText}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  background: "#1a1a1a",
  color: "#e0e0e0",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  width: "100%",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box"
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23666'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: "30px"
};

const labelStyle = {
  display: "block",
  color: "#555",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.12em",
  marginBottom: "6px",
  textTransform: "uppercase"
};


// ─── PIN LOGIN SCREEN ─────────────────────────────────────────────────────────
function PinScreen({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    setError('');
    try {
      const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      const res = await fetch(`${SERVER}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (res.ok) {
        localStorage.setItem('cp_pin', pin);
        onSuccess();
      } else {
        setError('PIN incorrecto');
        setPin('');
      }
    } catch {
      setError('Sin conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const s = {
    overlay: { position:'fixed', inset:0, background:'#080808', display:'flex',
      alignItems:'center', justifyContent:'center', zIndex:9999,
      fontFamily:"'DM Mono', monospace" },
    box: { background:'#0d0d0d', border:'1px solid #1e1e1e', borderRadius:'16px',
      padding:'48px 40px', display:'flex', flexDirection:'column',
      alignItems:'center', gap:'24px', minWidth:'320px' },
    title: { color:'#e0e0e0', fontSize:'13px', letterSpacing:'0.15em',
      fontWeight:'700', textTransform:'uppercase' },
    sub: { color:'#444', fontSize:'11px', marginTop:'-16px' },
    input: { background:'#141414', border:'1px solid #2a2a2a', borderRadius:'10px',
      padding:'14px 18px', color:'#e0e0e0', fontSize:'22px', textAlign:'center',
      letterSpacing:'0.4em', width:'100%', outline:'none',
      fontFamily:"'DM Mono', monospace" },
    btn: { background:'#4D79FF', color:'#fff', border:'none', borderRadius:'10px',
      padding:'12px 32px', fontSize:'12px', fontWeight:'700', cursor:'pointer',
      letterSpacing:'0.1em', width:'100%', fontFamily:"'DM Mono', monospace",
      opacity: loading ? 0.6 : 1 },
    error: { color:'#FF4D4D', fontSize:'11px' }
  };


  return (
    <div style={s.overlay}>
      <div style={s.box}>
        <div style={s.title}>Content Planner</div>
        <div style={s.sub}>Ingresa el PIN de acceso</div>
        <input
          style={s.input}
          type="password"
          placeholder="••••"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          maxLength={12}
          autoFocus
        />
        {error && <div style={s.error}>{error}</div>}
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'VERIFICANDO...' : 'ENTRAR'}
        </button>
      </div>
    </div>
  );
}

// ─── CONNECTION INDICATOR ─────────────────────────────────────────────────────
function ConnectionDot({ connected }) {

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'6px',
      fontSize:'10px', color: connected ? '#4CAF50' : '#FF4D4D',
      fontFamily:"'DM Mono', monospace", letterSpacing:'0.1em' }}>
      <div style={{ width:'7px', height:'7px', borderRadius:'50%',
        background: connected ? '#4CAF50' : '#FF4D4D',
        boxShadow: connected ? '0 0 6px #4CAF50' : 'none',
        animation: connected ? 'pulse 2s infinite' : 'none'
      }}/>
      {connected ? 'EN LÍNEA' : 'OFFLINE'}
    </div>
  );
}

export default function ContentPlanner() {
  const [authed, setAuthed] = useState(() => {
    // Check if already authed in this session
    return !!localStorage.getItem('cp_pin');
  });
  const [wsConnected, setWsConnected] = useState(false);
  const [cards, setCards] = useState([]);
  const [brands, setBrands] = useState([]);
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("planner");
  const [calView, setCalView] = useState("month");
  const [selectedCard, setSelectedCard] = useState(null);
  const [brandModal, setBrandModal] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", color: "#FF4D4D", initials: "" });

  // ── WebSocket + Server sync ──────────────────────────────────────────────
  const wsRef = useRef(null);
  const syncTimeoutRef = useRef({});
  const remoteUpdateRef = useRef(false); // flag to avoid re-sending received updates

  // Cargar datos del servidor al montar
  useEffect(() => {
    const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const WS_URL = SERVER.replace(/^http/, 'ws');

    fetch(`${SERVER}/api/data`)
      .then(r => r.json())
      .then(data => {
        remoteUpdateRef.current = true;
        if (data.cards?.length > 0) {
          nextId = Math.max(...data.cards.map(c => c.id), 0) + 1;
          setCards(data.cards);
        } else { setCards([createCard("")]); }
        if (data.brands?.length > 0) setBrands(data.brands);
        if (data.users?.length > 0) setUsers(data.users);
      })
      .catch(() => setCards([createCard("")]))
      .finally(() => setLoaded(true));

    // Conectar WebSocket
    const connectWS = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        remoteUpdateRef.current = true;
        if (msg.type === 'CARDS_UPDATED') {
          nextId = Math.max(...msg.payload.map(c => c.id), 0) + 1;
          setCards(msg.payload);
        }
        if (msg.type === 'BRANDS_UPDATED') setBrands(msg.payload);
        if (msg.type === 'USERS_UPDATED') setUsers(msg.payload);
      };

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        // Auto-reconnect after 3 seconds
        setTimeout(connectWS, 3000);
      };
      ws.onerror = () => { setWsConnected(false); };
    };

    connectWS();
    return () => wsRef.current?.close();
  }, []);

  // Sincronizar cards al servidor con debounce (solo si fue cambio local)
  useEffect(() => {
    if (!loaded) return;
    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false;
      return;
    }
    clearTimeout(syncTimeoutRef.current.cards);
    syncTimeoutRef.current.cards = setTimeout(() => {
      if (wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'UPDATE_CARDS', payload: cards }));
      }
    }, 600);
  }, [cards, loaded]);

  // Sincronizar brands (solo si fue cambio local)
  useEffect(() => {
    if (!loaded) return;
    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false;
      return;
    }
    clearTimeout(syncTimeoutRef.current.brands);
    syncTimeoutRef.current.brands = setTimeout(() => {
      if (wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'UPDATE_BRANDS', payload: brands }));
      }
    }, 600);
  }, [brands, loaded]);

  // Sincronizar users (solo si fue cambio local)
  useEffect(() => {
    if (!loaded) return;
    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false;
      return;
    }
    clearTimeout(syncTimeoutRef.current.users);
    syncTimeoutRef.current.users = setTimeout(() => {
      if (wsRef.current?.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'UPDATE_USERS', payload: users }));
      }
    }, 600);
  }, [users, loaded]);

  const PRESET_COLORS = ["#FF4D4D","#FF6B35","#F0C040","#4CAF50","#1ABC9C","#4D79FF","#9B59B6","#E91E8C","#00BCD4","#FF9800","#8BC34A","#607D8B"];

  const [brandDetailsModal, setBrandDetailsModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); // brand name being edited
  const [editBrandData, setEditBrandData] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);

  const addBrand = () => {
    const name = newBrand.name.trim();
    if (!name || brands.find(b => b.name === name)) return;
    const initials = newBrand.initials.trim() || name.slice(0,2).toUpperCase();
    setBrands([...brands, { name, color: newBrand.color, initials, logo: newBrand.logo || "" }]);
    setNewBrand({ name: "", color: "#FF4D4D", initials: "", logo: "" });
    setBrandModal(false);
  };

  const saveBrandEdit = () => {
    if (!editBrandData) return;
    const oldName = editingBrand;
    const updated = { ...editBrandData, initials: editBrandData.initials || editBrandData.name.slice(0,2).toUpperCase() };
    setBrands(brands.map(b => b.name === oldName ? updated : b));
    // update cards that reference old brand name
    if (updated.name !== oldName) {
      setCards(cards.map(c => c.brand === oldName ? { ...c, brand: updated.name } : c));
    }
    setEditingBrand(null);
    setEditBrandData(null);
  };

  const confirmDeleteBrand = () => {
    setBrands(brands.filter(b => b.name !== deletingBrand));
    setCards(cards.map(c => c.brand === deletingBrand ? { ...c, brand: "" } : c));
    if (brandFilter === deletingBrand) setBrandFilter("all");
    setDeletingBrand(null);
  };

  const getBrand = (name) => brands.find(b => b.name === name);

  const [drawerCardId, setDrawerCardId] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const drawerCard = cards.find(c => c.id === drawerCardId) || null;
  const deleteConfirmCard = cards.find(c => c.id === deleteConfirmId) || null;

  const addCard = () => {
    const newCard = createCard(brandFilter !== "all" ? brandFilter : "");
    setCards(prev => [...prev, newCard]);
    setDrawerCardId(newCard.id);
  };

  const openDrawer = (id) => setDrawerCardId(id);
  const closeDrawer = () => setDrawerCardId(null);
  const saveDrawer = () => setDrawerCardId(null);

  const updateCard = (id, key, val) => {
    setCards(cards.map(c => c.id === id ? { ...c, [key]: val } : c));
  };

  const requestDelete = (id) => setDeleteConfirmId(id);
  const cancelDelete = () => setDeleteConfirmId(null);
  const confirmDelete = () => {
    setCards(cards.filter(c => c.id !== deleteConfirmId));
    if (drawerCardId === deleteConfirmId) setDrawerCardId(null);
    setDeleteConfirmId(null);
  };

  const deleteCard = requestDelete;

  const filteredCards = cards.filter(c => {
    if (brandFilter !== "all" && c.brand !== brandFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (dateFrom && c.publishDate && c.publishDate < dateFrom) return false;
    if (dateTo && c.publishDate && c.publishDate > dateTo) return false;
    if ((dateFrom || dateTo) && !c.publishDate) return false;
    return true;
  });

  const hasDateFilter = dateFrom || dateTo;
  const clearDateFilter = () => { setDateFrom(""); setDateTo(""); };

  const stats = {
    total: cards.length,
    pendiente: cards.filter(c => c.status === "pendiente").length,
    produccion: cards.filter(c => c.status === "produccion").length,
    publicado: cards.filter(c => c.status === "publicado").length,
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", fontFamily: "'DM Mono',monospace" }}>
      <div style={{ fontSize: "22px", color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700" }}>◈ CONTENT PLANNER</div>
      <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.15em" }}>CARGANDO DATOS...</div>
      <div style={{ display: "flex", gap: "6px" }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#333", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,80%,100%{background:#222} 40%{background:#888} }`}</style>
    </div>
  );

  if (!authed) return <PinScreen onSuccess={() => setAuthed(true)} />;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#e0e0e0",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      padding: "0"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        input:focus, select:focus, textarea:focus { border-color: #444 !important; outline: none; }
        option { background: #1a1a1a; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#0d0d0d",
        borderBottom: "1px solid #1a1a1a",
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{
            fontSize: "22px",
            fontWeight: "700",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.02em",
            color: "#fff"
          }}>
            ◈ CONTENT PLANNER
          </div>
          <div style={{ fontSize: "11px", color: "#444", marginTop: "2px", letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: "8px" }}>
            GESTOR DE CONTENIDO · MULTI-MARCA
            <ConnectionDot connected={wsConnected} />
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:"4px", marginTop:"14px" }}>
            {[
              { key:"planner",  label:"≡  Planner" },
              { key:"calendar", label:"◫  Calendario" },
              { key:"gantt",    label:"◧  Gantt" },
              { key:"users",    label:"◉  Usuarios" },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                background: activeTab===t.key ? "#fff" : "transparent",
                color: activeTab===t.key ? "#000" : "#555",
                border: `1px solid ${activeTab===t.key ? "#fff" : "#2a2a2a"}`,
                borderRadius:"8px", padding:"5px 16px", fontSize:"11px",
                fontWeight:"700", cursor:"pointer", letterSpacing:"0.05em", fontFamily:"inherit"
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {[
            { label: "TOTAL", val: stats.total, color: "#888" },
            { label: "PENDIENTE", val: stats.pendiente, color: "#FF4D4D" },
            { label: "EN PROCESO", val: stats.produccion, color: "#FFC107" },
            { label: "PUBLICADO", val: stats.publicado, color: "#00E676" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: "9px", color: "#444", letterSpacing: "0.12em", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        {(activeTab === "planner" || activeTab === "calendar") && (<>
        {/* Brand Manager */}
        <div style={{
          background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px",
          padding: "16px 20px", marginBottom: "20px"
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"10px", color:"#444", letterSpacing:"0.12em", fontWeight:"700" }}>MARCAS:</span>
            {brands.map(b => {
              const active = brandFilter === b.name;
              return (
                <div key={b.name} onClick={() => setBrandFilter(active ? "all" : b.name)} style={{ display:"flex", alignItems:"center", gap:"7px", background: active ? b.color+"22" : "#111", border:`1.5px solid ${active ? b.color : "#222"}`, borderRadius:"24px", padding:"4px 12px 4px 4px", cursor:"pointer", transition:"all 0.15s" }}>
                  {b.logo ? (
                    <img src={b.logo} alt={b.name} style={{ width:"22px", height:"22px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                  ) : (
                    <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:b.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", fontWeight:"800", color:"#000", flexShrink:0 }}>{b.initials}</div>
                  )}
                  <span style={{ fontSize:"12px", color: active ? b.color : "#888", fontWeight: active?"700":"500" }}>{b.name}</span>
                </div>
              );
            })}
            <button onClick={() => setBrandModal(true)} style={{ background:"transparent", color:"#444", border:"1px dashed #333", borderRadius:"24px", padding:"5px 14px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", letterSpacing:"0.05em" }}
              onMouseEnter={e=>{e.target.style.color="#888";e.target.style.borderColor="#555";}} onMouseLeave={e=>{e.target.style.color="#444";e.target.style.borderColor="#333";}}>
              + Nueva marca
            </button>
            {brands.length > 0 && (
              <button onClick={() => setBrandDetailsModal(true)} style={{ marginLeft:"auto", background:"#1a1a1a", color:"#666", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"5px 14px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit", fontWeight:"700", letterSpacing:"0.05em", transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#ccc";e.currentTarget.style.borderColor="#444";}} onMouseLeave={e=>{e.currentTarget.style.color="#666";e.currentTarget.style.borderColor="#2a2a2a";}}>
                ⚙ Gestionar marcas
              </button>
            )}
          </div>
        </div>
        </>)}

        {/* Brand Details/Manager Modal */}
        {brandDetailsModal && (
          <div onClick={() => { setBrandDetailsModal(false); setEditingBrand(null); setEditBrandData(null); setDeletingBrand(null); }} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:"20px" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:"#111", border:"1px solid #222", borderRadius:"16px", padding:"28px", width:"100%", maxWidth:"520px", maxHeight:"80vh", overflowY:"auto" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"16px", fontWeight:"700", color:"#fff" }}>Gestionar marcas</div>
                <button onClick={()=>{setBrandDetailsModal(false);setEditingBrand(null);setEditBrandData(null);setDeletingBrand(null);}} style={{ background:"transparent", border:"none", color:"#555", fontSize:"20px", cursor:"pointer" }}>✕</button>
              </div>

              {brands.length === 0 && <div style={{ textAlign:"center", color:"#444", fontSize:"12px", padding:"20px" }}>No hay marcas registradas</div>}

              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {brands.map(b => (
                  <div key={b.name}>
                    {/* Delete confirm inline */}
                    {deletingBrand === b.name ? (
                      <div style={{ background:"#1a0a0a", border:"1px solid #FF4D4D40", borderRadius:"12px", padding:"14px 16px" }}>
                        <div style={{ fontSize:"12px", color:"#FF4D4D", fontWeight:"700", marginBottom:"10px" }}>¿Eliminar "{b.name}"? Las tarjetas perderán su marca asignada.</div>
                        <div style={{ display:"flex", gap:"8px" }}>
                          <button onClick={()=>setDeletingBrand(null)} style={{ flex:1, background:"transparent", color:"#666", border:"1px solid #333", borderRadius:"8px", padding:"8px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
                          <button onClick={confirmDeleteBrand} style={{ flex:1, background:"#FF4D4D", color:"#fff", border:"none", borderRadius:"8px", padding:"8px", fontSize:"11px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit" }}>🗑 Sí, eliminar</button>
                        </div>
                      </div>
                    ) : editingBrand === b.name && editBrandData ? (
                      /* Edit form inline */
                      <div style={{ background:"#141414", border:`1.5px solid ${editBrandData.color}40`, borderRadius:"12px", padding:"16px" }}>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px" }}>
                          <div style={{ gridColumn:"1/-1" }}>
                            <label style={labelStyle}>Nombre</label>
                            <input value={editBrandData.name} onChange={e=>setEditBrandData({...editBrandData, name:e.target.value})} style={inputStyle} />
                          </div>
                          <div>
                            <label style={labelStyle}>Iniciales</label>
                            <input value={editBrandData.initials} onChange={e=>setEditBrandData({...editBrandData, initials:e.target.value.slice(0,3).toUpperCase()})} maxLength={3} style={{ ...inputStyle, textTransform:"uppercase" }} />
                          </div>
                          <div>
                            <label style={labelStyle}>Color</label>
                            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
                              {PRESET_COLORS.map(c=>(
                                <div key={c} onClick={()=>setEditBrandData({...editBrandData,color:c})} style={{ width:"20px", height:"20px", borderRadius:"50%", background:c, cursor:"pointer", border:`2px solid ${editBrandData.color===c?"#fff":"transparent"}`, transform:editBrandData.color===c?"scale(1.2)":"scale(1)", transition:"all 0.1s" }} />
                              ))}
                            </div>
                            <input type="color" value={editBrandData.color} onChange={e=>setEditBrandData({...editBrandData,color:e.target.value})} style={{ width:"32px", height:"32px", border:"none", background:"none", cursor:"pointer", padding:0 }} />
                          </div>
                          <div style={{ gridColumn:"1/-1" }}>
                            <label style={labelStyle}>Logotipo</label>
                            <LogoUploader value={editBrandData.logo || ""} color={editBrandData.color} initials={editBrandData.initials} onChange={logo=>setEditBrandData({...editBrandData, logo})} />
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:"8px" }}>
                          <button onClick={()=>{setEditingBrand(null);setEditBrandData(null);}} style={{ flex:1, background:"transparent", color:"#555", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"8px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
                          <button onClick={saveBrandEdit} style={{ flex:2, background:editBrandData.color, color:"#000", border:"none", borderRadius:"8px", padding:"8px", fontSize:"11px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit" }}>✓ Guardar cambios</button>
                        </div>
                      </div>
                    ) : (
                      /* Brand row */
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"12px", padding:"12px 14px" }}>
                        {b.logo ? (
                          <img src={b.logo} alt={b.name} style={{ width:"36px", height:"36px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                        ) : (
                          <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:b.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"800", color:"#000", flexShrink:0 }}>{b.initials}</div>
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"13px", fontWeight:"700", color:"#e0e0e0", fontFamily:"'Space Grotesk',sans-serif" }}>{b.name}</div>
                          <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"3px" }}>
                            <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:b.color }} />
                            <span style={{ fontSize:"10px", color:"#444" }}>{b.color}</span>
                            <span style={{ fontSize:"10px", color:"#333" }}>·</span>
                            <span style={{ fontSize:"10px", color:"#444" }}>{cards.filter(c=>c.brand===b.name).length} contenidos</span>
                          </div>
                        </div>
                        <button onClick={()=>{setEditingBrand(b.name);setEditBrandData({...b});}} style={{ background:"#1a1a1a", color:"#888", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"6px 12px", fontSize:"11px", cursor:"pointer", fontFamily:"inherit", fontWeight:"600" }}>✏ Editar</button>
                        <button onClick={()=>setDeletingBrand(b.name)} style={{ background:"transparent", color:"#444", border:"1px solid #222", borderRadius:"8px", padding:"6px 10px", fontSize:"13px", cursor:"pointer" }}>🗑</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={()=>{setBrandDetailsModal(false);setBrandModal(true);}} style={{ width:"100%", marginTop:"16px", background:"transparent", color:"#555", border:"1px dashed #2a2a2a", borderRadius:"10px", padding:"10px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit", fontWeight:"700" }}>+ Agregar nueva marca</button>
            </div>
          </div>
        )}

        {/* New Brand Modal */}
        {brandModal && (
          <div onClick={() => setBrandModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:"20px" }}>
            <div onClick={e => e.stopPropagation()} style={{ background:"#111", border:"1px solid #222", borderRadius:"16px", padding:"28px", width:"100%", maxWidth:"460px", maxHeight:"90vh", overflowY:"auto" }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"16px", fontWeight:"700", color:"#fff", marginBottom:"20px" }}>Nueva marca</div>

              {/* Preview */}
              <div style={{ display:"flex", alignItems:"center", gap:"12px", background:"#0d0d0d", border:`1.5px solid ${newBrand.color}`, borderRadius:"12px", padding:"14px 16px", marginBottom:"20px" }}>
                {newBrand.logo ? (
                  <img src={newBrand.logo} alt="logo" style={{ width:"42px", height:"42px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                ) : (
                  <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:newBrand.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"800", color:"#000", flexShrink:0 }}>
                    {(newBrand.initials || newBrand.name.slice(0,2)).toUpperCase() || "??"}
                  </div>
                )}
                <div>
                  <div style={{ fontSize:"15px", fontWeight:"700", color:"#fff", fontFamily:"'Space Grotesk',sans-serif" }}>{newBrand.name || "Nombre de marca"}</div>
                  <div style={{ fontSize:"10px", color:newBrand.color, marginTop:"2px", letterSpacing:"0.08em" }}>{newBrand.color}</div>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div>
                  <label style={labelStyle}>Nombre de la marca</label>
                  <input value={newBrand.name} onChange={e=>setNewBrand({...newBrand, name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addBrand()} placeholder="Ej: Nike, Mi Empresa, Proyecto X..." autoFocus style={inputStyle} />
                </div>

                {/* Iniciales + Logo side by side */}
                <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:"12px", alignItems:"start" }}>
                  <div>
                    <label style={labelStyle}>Iniciales (2-3 letras)</label>
                    <input value={newBrand.initials} onChange={e=>setNewBrand({...newBrand, initials:e.target.value.slice(0,3).toUpperCase()})} placeholder="NK" maxLength={3} style={{ ...inputStyle, textTransform:"uppercase" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Logotipo de marca</label>
                    <LogoUploader value={newBrand.logo || ""} color={newBrand.color} initials={newBrand.initials || newBrand.name.slice(0,2)} onChange={logo=>setNewBrand({...newBrand, logo})} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Color de marca</label>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"10px" }}>
                    {PRESET_COLORS.map(c=>(
                      <div key={c} onClick={()=>setNewBrand({...newBrand, color:c})} style={{ width:"26px", height:"26px", borderRadius:"50%", background:c, cursor:"pointer", border:`2px solid ${newBrand.color===c?"#fff":"transparent"}`, transition:"all 0.1s", transform:newBrand.color===c?"scale(1.2)":"scale(1)" }} />
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                    <input type="color" value={newBrand.color} onChange={e=>setNewBrand({...newBrand, color:e.target.value})} style={{ width:"36px", height:"36px", border:"none", background:"none", cursor:"pointer", padding:0, borderRadius:"6px" }} />
                    <span style={{ fontSize:"11px", color:"#555" }}>Color personalizado</span>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:"8px", marginTop:"24px" }}>
                <button onClick={()=>setBrandModal(false)} style={{ flex:1, background:"transparent", color:"#555", border:"1px solid #2a2a2a", borderRadius:"8px", padding:"10px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>Cancelar</button>
                <button onClick={addBrand} style={{ flex:2, background:newBrand.color, color:"#000", border:"none", borderRadius:"8px", padding:"10px", fontSize:"12px", fontWeight:"800", cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.05em" }}>+ Agregar marca</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "planner" && (
          <>
            {/* Filters */}
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Status filter row */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.12em", fontWeight: "700", minWidth: "60px" }}>ESTADO:</span>
                {["all", "pendiente", "produccion", "edicion", "revision", "aprobado", "publicado"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      background: statusFilter === s ? "#222" : "transparent",
                      color: statusFilter === s ? "#e0e0e0" : "#555",
                      border: `1px solid ${statusFilter === s ? "#444" : "#222"}`,
                      borderRadius: "6px", padding: "4px 12px", fontSize: "11px",
                      cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit"
                    }}
                  >{s === "all" ? "Todos" : s}</button>
                ))}
              </div>

              {/* Date range row */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.12em", fontWeight: "700", minWidth: "60px" }}>FECHAS:</span>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "10px", color: "#555" }}>DE</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      style={{
                        background: dateFrom ? "#1a1a2e" : "#1a1a1a",
                        color: dateFrom ? "#7B9FF5" : "#555",
                        border: `1px solid ${dateFrom ? "#2a2a4a" : "#2a2a2a"}`,
                        borderRadius: "8px", padding: "5px 10px",
                        fontSize: "12px", fontFamily: "inherit",
                        colorScheme: "dark", outline: "none", cursor: "pointer"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "10px", color: "#555" }}>A</span>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={e => setDateTo(e.target.value)}
                      style={{
                        background: dateTo ? "#1a1a2e" : "#1a1a1a",
                        color: dateTo ? "#7B9FF5" : "#555",
                        border: `1px solid ${dateTo ? "#2a2a4a" : "#2a2a2a"}`,
                        borderRadius: "8px", padding: "5px 10px",
                        fontSize: "12px", fontFamily: "inherit",
                        colorScheme: "dark", outline: "none", cursor: "pointer"
                      }}
                    />
                  </div>

                  {hasDateFilter && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: "20px", padding: "3px 10px 3px 8px" }}>
                        <span style={{ fontSize: "9px", color: "#7B9FF5" }}>📅</span>
                        <span style={{ fontSize: "10px", color: "#7B9FF5", fontWeight: "700" }}>
                          {filteredCards.length} resultado{filteredCards.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <button
                        onClick={clearDateFilter}
                        style={{
                          background: "transparent", color: "#FF4D4D",
                          border: "1px solid #FF4D4D30", borderRadius: "6px",
                          padding: "4px 10px", fontSize: "10px",
                          cursor: "pointer", fontFamily: "inherit", fontWeight: "700"
                        }}
                      >✕ Limpiar</button>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Cards */}
            {filteredCards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#333", fontSize: "13px", letterSpacing: "0.1em" }}>
                NO HAY CONTENIDO PARA MOSTRAR
              </div>
            ) : (
              filteredCards.map(card => (
                <ContentCard key={card.id} card={card} brands={brands} onEdit={openDrawer} onDelete={deleteCard} />
              ))
            )}

            {/* Add Button */}
            <button
              onClick={addCard}
              style={{
                width: "100%", background: "transparent", color: "#333",
                border: "1px dashed #222", borderRadius: "12px", padding: "16px",
                fontSize: "12px", fontWeight: "700", cursor: "pointer",
                letterSpacing: "0.15em", marginTop: "8px", transition: "all 0.2s", fontFamily: "inherit"
              }}
              onMouseEnter={e => { e.target.style.color = "#888"; e.target.style.borderColor = "#444"; }}
              onMouseLeave={e => { e.target.style.color = "#333"; e.target.style.borderColor = "#222"; }}
            >
              + AGREGAR CONTENIDO
            </button>
          </>
        )}

        {activeTab === "calendar" && (
          <div>
            {/* Calendar sub-view toggle */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"24px", alignItems:"center" }}>
              <span style={{ fontSize:"10px", color:"#444", letterSpacing:"0.12em", fontWeight:"700", marginRight:"6px" }}>VISTA:</span>
              {[{ key:"month", label:"Mensual" },{ key:"week", label:"Semanal" }].map(v => (
                <button key={v.key} onClick={() => setCalView(v.key)} style={{
                  background: calView===v.key ? "#222" : "transparent",
                  color: calView===v.key ? "#e0e0e0" : "#555",
                  border:`1px solid ${calView===v.key ? "#444" : "#222"}`,
                  borderRadius:"6px", padding:"5px 16px", fontSize:"11px",
                  cursor:"pointer", fontFamily:"inherit", fontWeight: calView===v.key ? "700" : "400"
                }}>{v.label}</button>
              ))}
              <span style={{ marginLeft:"auto", fontSize:"10px", color:"#333" }}>
                {cards.filter(c=>c.publishDate).length} contenidos con fecha asignada
              </span>
            </div>

            {calView === "month"
              ? <CalendarMonthly cards={cards} brands={brands} onCardClick={setSelectedCard} />
              : <CalendarWeekly cards={cards} brands={brands} onCardClick={setSelectedCard} />
            }

            {cards.filter(c => !c.publishDate).length > 0 && (
              <div style={{ marginTop:"24px", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"10px", padding:"14px 18px" }}>
                <div style={{ fontSize:"10px", color:"#555", fontWeight:"700", letterSpacing:"0.1em", marginBottom:"10px" }}>
                  SIN FECHA ASIGNADA ({cards.filter(c=>!c.publishDate).length})
                </div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {cards.filter(c=>!c.publishDate).map(c => {
                    const ct = CONTENT_TYPES[c.contentType];
                    return (
                      <div key={c.id} onClick={() => setSelectedCard(c)} style={{
                        background: ct?ct.color+"18":"#1a1a1a",
                        border:`1px solid ${ct?ct.color+"40":"#222"}`,
                        borderRadius:"6px", padding:"5px 10px", cursor:"pointer",
                        fontSize:"11px", color: ct?ct.color:"#888", fontWeight:"700"
                      }}>
                        {ct?.icon} {c.brand||"Sin marca"} · {ct?.label||"—"}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "gantt" && (
          <GanttView cards={cards} brands={brands} users={users} onEdit={openDrawer} />
        )}

        {activeTab === "users" && (
          <UsersView users={users} setUsers={setUsers} />
        )}

      </div>

      <CardDetailModal card={selectedCard} brands={brands} onClose={() => setSelectedCard(null)} onOpenDrawer={(id) => { setSelectedCard(null); openDrawer(id); }} />

      {drawerCard && (
        <ContentDrawer
          card={drawerCard}
          brands={brands}
          users={users}
          onUpdate={updateCard}
          onSave={saveDrawer}
          onClose={closeDrawer}
        />
      )}

      <DeleteConfirmModal
        card={deleteConfirmCard}
        brands={brands}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
