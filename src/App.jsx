import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, X, Lock, Unlock, Pencil, Trash2, Mail, Phone, MapPin, Clock, Tag, Loader2 } from "lucide-react";

/* ---------------------------------------------------------------
   COME AND SEE – Tableau d'offres (pétrole & projets divers)
   Design: "trading desk" industriel — fond ardoise profond,
   accents ambre (flamme de raffinerie) & cyan (jauge), données
   numériques en mono comme un ticker de bourse.
---------------------------------------------------------------- */

const PASSCODE = "COMEANDSEE2026"; // à communiquer uniquement au propriétaire du site

/* Stockage : utilise window.storage quand disponible (aperçu Claude, partagé
   entre tous les visiteurs), sinon repli sur localStorage (stockage local au
   navigateur uniquement) une fois le site hébergé de façon autonome. */
const storageAdapter = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage) {
      try {
        return await window.storage.get(key, true);
      } catch (e) {
        return null;
      }
    }
    const v = localStorage.getItem(key);
    return v ? { value: v } : null;
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage) {
      try {
        return await window.storage.set(key, value, true);
      } catch (e) {
        return null;
      }
    }
    localStorage.setItem(key, value);
    return { value };
  },
};

const STRINGS = {
  fr: {
    tagline: "Bureau de négoce — pétrole & projets",
    lock: "Mode édition",
    unlock: "Édition active",
    locked_hint: "Connectez-vous pour publier une offre",
    login_title: "Accès édition",
    login_placeholder: "Code d'accès",
    login_submit: "Entrer",
    login_error: "Code incorrect",
    logout: "Se déconnecter",
    new_offer: "Nouvelle offre",
    edit_offer: "Modifier l'offre",
    all: "Toutes",
    empty_title: "Aucune offre pour le moment",
    empty_sub: "Les offres publiées apparaîtront ici.",
    empty_cta: "Publier la première offre",
    field_category: "Catégorie",
    field_category_ph: "Pétrole, BTP, Import-export…",
    field_title: "Titre de l'offre",
    field_title_ph: "Ex : Diesel EN590 10ppm — Nigeria",
    field_quantity: "Quantité",
    field_quantity_ph: "Ex : 30 000 MT",
    field_price: "Prix",
    field_price_ph: "Ex : 710 USD/MT",
    field_origin: "Origine",
    field_origin_ph: "Ex : Nigeria",
    field_delivery: "Délai de livraison",
    field_delivery_ph: "Ex : 10 jours",
    field_validity: "Validité de l'offre",
    field_validity_ph: "Ex : 5 jours ou 15/08/2026",
    field_description: "Description",
    field_description_ph: "Détails, modalités de paiement, conditions…",
    field_contact: "Contact",
    field_contact_ph: "Email ou téléphone",
    cancel: "Annuler",
    save: "Publier",
    save_edit: "Enregistrer",
    delete: "Supprimer",
    delete_confirm: "Supprimer cette offre ?",
    contact_btn: "Contacter",
    posted: "Publié le",
    loading: "Chargement des offres…",
    required: "Champs requis manquants",
  },
  en: {
    tagline: "Trading desk — petroleum & projects",
    lock: "Edit mode",
    unlock: "Editing active",
    locked_hint: "Log in to publish an offer",
    login_title: "Edit access",
    login_placeholder: "Access code",
    login_submit: "Enter",
    login_error: "Incorrect code",
    logout: "Log out",
    new_offer: "New offer",
    edit_offer: "Edit offer",
    all: "All",
    empty_title: "No offers yet",
    empty_sub: "Published offers will appear here.",
    empty_cta: "Publish the first offer",
    field_category: "Category",
    field_category_ph: "Petroleum, Construction, Import-export…",
    field_title: "Offer title",
    field_title_ph: "E.g. Diesel EN590 10ppm — Nigeria",
    field_quantity: "Quantity",
    field_quantity_ph: "E.g. 30,000 MT",
    field_price: "Price",
    field_price_ph: "E.g. USD 710/MT",
    field_origin: "Origin",
    field_origin_ph: "E.g. Nigeria",
    field_delivery: "Delivery time",
    field_delivery_ph: "E.g. 10 days",
    field_validity: "Offer validity",
    field_validity_ph: "E.g. 5 days or 08/15/2026",
    field_description: "Description",
    field_description_ph: "Details, payment terms, conditions…",
    field_contact: "Contact",
    field_contact_ph: "Email or phone",
    cancel: "Cancel",
    save: "Publish",
    save_edit: "Save",
    delete: "Delete",
    delete_confirm: "Delete this offer?",
    contact_btn: "Contact",
    posted: "Posted on",
    loading: "Loading offers…",
    required: "Missing required fields",
  },
  pt: {
    tagline: "Mesa de negociação — petróleo & projetos",
    lock: "Modo de edição",
    unlock: "Edição ativa",
    locked_hint: "Entre para publicar uma oferta",
    login_title: "Acesso de edição",
    login_placeholder: "Código de acesso",
    login_submit: "Entrar",
    login_error: "Código incorreto",
    logout: "Sair",
    new_offer: "Nova oferta",
    edit_offer: "Editar oferta",
    all: "Todas",
    empty_title: "Nenhuma oferta por enquanto",
    empty_sub: "As ofertas publicadas aparecerão aqui.",
    empty_cta: "Publicar a primeira oferta",
    field_category: "Categoria",
    field_category_ph: "Petróleo, Construção, Importação-exportação…",
    field_title: "Título da oferta",
    field_title_ph: "Ex: Diesel EN590 10ppm — Nigéria",
    field_quantity: "Quantidade",
    field_quantity_ph: "Ex: 30.000 MT",
    field_price: "Preço",
    field_price_ph: "Ex: 710 USD/MT",
    field_origin: "Origem",
    field_origin_ph: "Ex: Nigéria",
    field_delivery: "Prazo de entrega",
    field_delivery_ph: "Ex: 10 dias",
    field_validity: "Validade da oferta",
    field_validity_ph: "Ex: 5 dias ou 15/08/2026",
    field_description: "Descrição",
    field_description_ph: "Detalhes, condições de pagamento…",
    field_contact: "Contacto",
    field_contact_ph: "Email ou telefone",
    cancel: "Cancelar",
    save: "Publicar",
    save_edit: "Guardar",
    delete: "Eliminar",
    delete_confirm: "Eliminar esta oferta?",
    contact_btn: "Contactar",
    posted: "Publicado em",
    loading: "A carregar ofertas…",
    required: "Campos obrigatórios em falta",
  },
};

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];

const TAG_PALETTE = [
  { bg: "#2A2016", text: "#E3A93B", ring: "#4A3A1F" },
  { bg: "#12262A", text: "#3FC1BE", ring: "#1D3A3D" },
  { bg: "#231A2C", text: "#B98CE0", ring: "#3A2A48" },
  { bg: "#241417", text: "#E0708C", ring: "#3D2229" },
  { bg: "#152414", text: "#7FCB6E", ring: "#243D22" },
  { bg: "#12202B", text: "#5FA8E0", ring: "#1E3547" },
];

function tagColor(category) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
}

function isEmail(v) {
  return /\S+@\S+\.\S+/.test(v);
}
function isPhone(v) {
  return /^[+()\d\s-]{6,}$/.test(v);
}

const emptyForm = {
  category: "",
  title: "",
  quantity: "",
  price: "",
  origin: "",
  delivery: "",
  validity: "",
  description: "",
  contact: "",
};

export default function OffersBoard() {
  const [lang, setLang] = useState("fr");
  const t = STRINGS[lang];

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);

  const [unlocked, setUnlocked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState(false);

  const [activeCategory, setActiveCategory] = useState("__all__");

  useEffect(() => {
    (async () => {
      try {
        const res = await storageAdapter.get("offers");
        if (res && res.value) {
          setOffers(JSON.parse(res.value));
        }
      } catch (e) {
        // key not found yet — fine, start empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(next) {
    setOffers(next);
    try {
      const res = await storageAdapter.set("offers", JSON.stringify(next));
      if (!res) setStorageError(true);
    } catch (e) {
      setStorageError(true);
    }
  }

  const categories = useMemo(() => {
    const set = new Set(offers.map((o) => o.category.trim()).filter(Boolean));
    return Array.from(set);
  }, [offers]);

  const visibleOffers = useMemo(() => {
    const list =
      activeCategory === "__all__"
        ? offers
        : offers.filter((o) => o.category.trim() === activeCategory);
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [offers, activeCategory]);

  function tryLogin() {
    if (loginInput === PASSCODE) {
      setUnlocked(true);
      setShowLogin(false);
      setLoginInput("");
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  }

  function openNewForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(false);
    setShowForm(true);
  }

  function openEditForm(offer) {
    setForm({
      category: offer.category,
      title: offer.title,
      quantity: offer.quantity,
      price: offer.price,
      origin: offer.origin,
      delivery: offer.delivery,
      description: offer.description,
      contact: offer.contact,
    });
    setEditingId(offer.id);
    setFormError(false);
    setShowForm(true);
  }

  function submitForm() {
    if (!form.category.trim() || !form.title.trim() || !form.quantity.trim() || !form.price.trim()) {
      setFormError(true);
      return;
    }
    if (editingId) {
      const next = offers.map((o) => (o.id === editingId ? { ...o, ...form } : o));
      persist(next);
    } else {
      const next = [
        ...offers,
        { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...form, createdAt: Date.now() },
      ];
      persist(next);
    }
    setShowForm(false);
  }

  function deleteOffer(id) {
    if (!window.confirm(t.delete_confirm)) return;
    persist(offers.filter((o) => o.id !== id));
  }

  const tickerItems = offers.length
    ? offers
    : [{ id: "placeholder", category: "—", title: "—", quantity: "", price: "" }];

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: INK }}>
      <FontImports />

      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${LINE}`,
          background: PANEL,
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: "0.01em", color: INK, lineHeight: 1.15 }}>
                COME AND SEE <span style={{ color: AMBER }}>–</span> COMÉRCIO E PRESTAÇÃO
              </span>
              <span style={{ fontSize: 12.5, color: MUTED, letterSpacing: "0.03em" }}>{t.tagline}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", border: `1px solid ${LINE}`, borderRadius: 8, overflow: "hidden" }}>
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  style={{
                    padding: "6px 11px",
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.04em",
                    background: lang === l.code ? AMBER : "transparent",
                    color: lang === l.code ? "#1A1206" : MUTED,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: lang === l.code ? 700 : 500,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {unlocked ? (
              <button
                onClick={() => setUnlocked(false)}
                title={t.logout}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, border: `1px solid ${CYAN}55`,
                  background: `${CYAN}15`, color: CYAN, fontSize: 12.5, cursor: "pointer",
                }}
              >
                <Unlock size={14} /> {t.unlock}
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                title={t.locked_hint}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 12px", borderRadius: 8, border: `1px solid ${LINE}`,
                  background: "transparent", color: MUTED, fontSize: 12.5, cursor: "pointer",
                }}
              >
                <Lock size={14} /> {t.lock}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Ticker */}
      <Ticker items={tickerItems} />

      {/* Category filters + new offer */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip active={activeCategory === "__all__"} onClick={() => setActiveCategory("__all__")} label={t.all} />
            {categories.map((c) => (
              <Chip key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} label={c} color={tagColor(c)} />
            ))}
          </div>

          {unlocked && (
            <button
              onClick={openNewForm}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 16px", borderRadius: 9, border: "none",
                background: AMBER, color: "#1A1206", fontWeight: 700, fontSize: 13.5,
                cursor: "pointer", boxShadow: "0 4px 14px rgba(217,168,59,0.25)",
              }}
            >
              <Plus size={16} /> {t.new_offer}
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "22px 20px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: MUTED, padding: "60px 0", justifyContent: "center", fontSize: 14 }}>
            <Loader2 size={18} className="spin" style={{ animation: "spin 1s linear infinite" }} /> {t.loading}
          </div>
        ) : visibleOffers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 20px", border: `1px dashed ${LINE}`, borderRadius: 14 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, marginBottom: 6 }}>{t.empty_title}</div>
            <div style={{ color: MUTED, fontSize: 14, marginBottom: unlocked ? 18 : 0 }}>{t.empty_sub}</div>
            {unlocked && (
              <button
                onClick={openNewForm}
                style={{ padding: "10px 18px", borderRadius: 9, border: "none", background: AMBER, color: "#1A1206", fontWeight: 700, cursor: "pointer" }}
              >
                {t.empty_cta}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {visibleOffers.map((o) => (
              <OfferCard key={o.id} offer={o} t={t} unlocked={unlocked} onEdit={() => openEditForm(o)} onDelete={() => deleteOffer(o.id)} />
            ))}
          </div>
        )}
      </main>

      {/* Login modal */}
      {showLogin && (
        <Modal onClose={() => { setShowLogin(false); setLoginError(false); setLoginInput(""); }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, marginBottom: 14 }}>{t.login_title}</div>
          <input
            type="password"
            autoFocus
            value={loginInput}
            onChange={(e) => { setLoginInput(e.target.value); setLoginError(false); }}
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
            placeholder={t.login_placeholder}
            style={inputStyle}
          />
          {loginError && <div style={{ color: RED, fontSize: 12.5, marginTop: 8 }}>{t.login_error}</div>}
          <button onClick={tryLogin} style={{ ...primaryBtn, marginTop: 16, width: "100%" }}>
            {t.login_submit}
          </button>
        </Modal>
      )}

      {/* Offer form modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} wide>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, marginBottom: 16 }}>
            {editingId ? t.edit_offer : t.new_offer}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t.field_category} required>
              <input list="cat-list" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t.field_category_ph} style={inputStyle} />
              <datalist id="cat-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <Field label={t.field_title} required>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.field_title_ph} style={inputStyle} />
            </Field>
            <Field label={t.field_quantity} required mono>
              <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder={t.field_quantity_ph} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label={t.field_price} required mono>
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder={t.field_price_ph} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} />
            </Field>
            <Field label={t.field_origin}>
              <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder={t.field_origin_ph} style={inputStyle} />
            </Field>
            <Field label={t.field_delivery}>
              <input value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} placeholder={t.field_delivery_ph} style={inputStyle} />
            </Field>
            <Field label={t.field_validity}>
              <input value={form.validity} onChange={(e) => setForm({ ...form, validity: e.target.value })} placeholder={t.field_validity_ph} style={inputStyle} />
            </Field>
            <Field label={t.field_contact} full>
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder={t.field_contact_ph} style={inputStyle} />
            </Field>
            <Field label={t.field_description} full>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t.field_description_ph} style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', sans-serif" }} />
            </Field>
          </div>

          {formError && <div style={{ color: RED, fontSize: 12.5, marginTop: 10 }}>{t.required}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowForm(false)} style={{ ...ghostBtn, flex: 1 }}>{t.cancel}</button>
            <button onClick={submitForm} style={{ ...primaryBtn, flex: 1 }}>{editingId ? t.save_edit : t.save}</button>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        input::placeholder, textarea::placeholder { color: ${MUTED}; opacity: 0.7; }
        input:focus, textarea:focus { outline: none; border-color: ${AMBER} !important; }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Logo() {
  return (
    <svg width="34" height="38" viewBox="0 0 40 46" fill="none" aria-hidden="true">
      {/* globe */}
      <circle cx="20" cy="14" r="9" stroke={AMBER} strokeWidth="1.6" />
      <ellipse cx="20" cy="14" rx="3.6" ry="9" stroke={CYAN} strokeWidth="1.2" />
      <line x1="11" y1="14" x2="29" y2="14" stroke={CYAN} strokeWidth="1.2" />
      {/* raised arms holding the globe */}
      <path d="M16.5,33 Q13,27 13.2,22.5" stroke={AMBER} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M23.5,33 Q27,27 26.8,22.5" stroke={AMBER} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="13.2" cy="22" r="1.5" fill={CYAN} />
      <circle cx="26.8" cy="22" r="1.5" fill={CYAN} />
      {/* head */}
      <circle cx="20" cy="29.5" r="3" fill={AMBER} />
      {/* body */}
      <path d="M14,44.5 C14,37.5 16.2,34.5 20,34.5 C23.8,34.5 26,37.5 26,44.5 Z" fill={AMBER} opacity="0.92" />
    </svg>
  );
}

function Ticker({ items }) {
  const track = items.concat(items); // duplicate for seamless loop
  return (
    <div style={{ background: "#0D1520", borderBottom: `1px solid ${LINE}`, overflow: "hidden", padding: "9px 0" }}>
      <div className="ticker-track" style={{ display: "flex", width: "max-content", animation: "ticker-scroll 38s linear infinite" }}>
        {track.map((o, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 26px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: MUTED, whiteSpace: "nowrap" }}>
            <span style={{ color: AMBER }}>{o.category}</span>
            <span style={{ color: INK }}>{o.title}</span>
            {o.quantity && <span>· {o.quantity}</span>}
            {o.price && <span style={{ color: CYAN }}>· {o.price}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, label, color }) {
  const c = color || { bg: "#1B2430", text: MUTED, ring: LINE };
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 13px",
        borderRadius: 20,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        border: `1px solid ${active ? AMBER : c.ring}`,
        background: active ? `${AMBER}1F` : c.bg,
        color: active ? AMBER : c.text,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

function OfferCard({ offer, t, unlocked, onEdit, onDelete }) {
  const c = tagColor(offer.category);
  const date = offer.createdAt ? new Date(offer.createdAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "";
  const contactHref = offer.contact
    ? isEmail(offer.contact) ? `mailto:${offer.contact}` : isPhone(offer.contact) ? `tel:${offer.contact.replace(/\s/g, "")}` : null
    : null;

  return (
    <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", padding: "4px 9px", borderRadius: 6, background: c.bg, color: c.text }}>
          {offer.category}
        </span>
        {unlocked && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onEdit} title={t.edit_offer} style={iconBtn}><Pencil size={14} /></button>
            <button onClick={onDelete} title={t.delete} style={{ ...iconBtn, color: RED }}><Trash2 size={14} /></button>
          </div>
        )}
      </div>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16.5, fontWeight: 600, color: INK, lineHeight: 1.3 }}>
        {offer.title}
      </div>

      <div style={{ display: "flex", gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13.5 }}>
        {offer.quantity && <span style={{ color: INK }}>{offer.quantity}</span>}
        {offer.price && <span style={{ color: AMBER, fontWeight: 700 }}>{offer.price}</span>}
      </div>

      {offer.description && (
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{offer.description}</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4, fontSize: 12.5, color: MUTED }}>
        {offer.origin && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={12.5} /> {offer.origin}</span>}
        {offer.delivery && <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={12.5} /> {offer.delivery}</span>}
        {offer.validity && <span style={{ display: "flex", alignItems: "center", gap: 6, color: RED }}><Tag size={12.5} /> {t.field_validity} : {offer.validity}</span>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
        <span style={{ fontSize: 11, color: MUTED }}>{date && `${t.posted} ${date}`}</span>
        {offer.contact && (
          contactHref ? (
            <a href={contactHref} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: CYAN, textDecoration: "none", fontWeight: 600 }}>
              {isEmail(offer.contact) ? <Mail size={13} /> : <Phone size={13} />} {t.contact_btn}
            </a>
          ) : (
            <span style={{ fontSize: 12.5, color: CYAN }}>{offer.contact}</span>
          )
        )}
      </div>
    </div>
  );
}

function Field({ label, children, required, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto", display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>
        {label}{required && <span style={{ color: AMBER }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Modal({ children, onClose, wide }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(6,10,16,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, padding: 24, width: "100%", maxWidth: wide ? 560 : 360, maxHeight: "90vh", overflowY: "auto", position: "relative" }}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: MUTED, cursor: "pointer" }}>
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function FontImports() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
    `}</style>
  );
}

/* ---------------- tokens ---------------- */
const BG = "#0B121B";
const PANEL = "#121B27";
const LINE = "#22303F";
const INK = "#E7ECF2";
const MUTED = "#8494A6";
const AMBER = "#D9A83B";
const CYAN = "#3FC1BE";
const RED = "#E0708C";

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  borderRadius: 8,
  border: `1px solid ${LINE}`,
  background: "#0D1620",
  color: INK,
  fontSize: 13.5,
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
};

const primaryBtn = {
  padding: "10px 16px",
  borderRadius: 9,
  border: "none",
  background: AMBER,
  color: "#1A1206",
  fontWeight: 700,
  fontSize: 13.5,
  cursor: "pointer",
};

const ghostBtn = {
  padding: "10px 16px",
  borderRadius: 9,
  border: `1px solid ${LINE}`,
  background: "transparent",
  color: MUTED,
  fontWeight: 600,
  fontSize: 13.5,
  cursor: "pointer",
};

const iconBtn = {
  width: 26,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  border: `1px solid ${LINE}`,
  background: "transparent",
  color: MUTED,
  cursor: "pointer",
};
