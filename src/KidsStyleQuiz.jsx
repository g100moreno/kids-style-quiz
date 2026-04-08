import { useState, useEffect, useRef } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap";

const STEPS = [
  {
    id: "welcome",
    type: "welcome",
    title: "Little styles, big smiles",
    subtitle: "Tell us about your little one and we'll curate adorable outfits they'll actually want to wear.",
  },
  {
    id: "parent_name",
    type: "text",
    title: "What's your name?",
    subtitle: "So our stylists know who they're working with.",
    placeholder: "Your first name",
  },
  {
    id: "child_name",
    type: "text",
    title: "And your little one's name?",
    subtitle: "We'll use this to personalize their box.",
    placeholder: "Their first name",
  },
  {
    id: "child_age",
    type: "single",
    title: "How old are they?",
    subtitle: "This helps us pick age-appropriate styles and sizes.",
    options: [
      { label: "0–6 months", emoji: "👶" },
      { label: "6–12 months", emoji: "🍼" },
      { label: "1–2 years", emoji: "🧸" },
      { label: "2–3 years", emoji: "🎨" },
      { label: "3–5 years", emoji: "🌈" },
    ],
  },
  {
    id: "child_gender",
    type: "single",
    title: "What do you usually shop for?",
    subtitle: "Or skip the labels entirely — we love that too.",
    options: [
      { label: "Boys' styles", emoji: "🦖" },
      { label: "Girls' styles", emoji: "🦋" },
      { label: "Gender neutral", emoji: "🌟" },
      { label: "Mix of everything", emoji: "🎨" },
    ],
  },
  {
    id: "sizes",
    type: "multi-row",
    title: "What sizes fit right now?",
    subtitle: "Kids grow fast — just pick what fits today, we'll keep up.",
    rows: [
      { label: "Tops", options: ["NB", "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2T", "3T", "4T", "5T"] },
      { label: "Bottoms", options: ["NB", "0-3M", "3-6M", "6-9M", "9-12M", "12-18M", "18-24M", "2T", "3T", "4T", "5T"] },
      { label: "Shoes", options: ["No shoes yet", "Size 1-2", "Size 3-4", "Size 5-6", "Size 7-8", "Size 9-10"] },
    ],
  },
  {
    id: "style_vibe",
    type: "multi",
    title: "What's their style vibe?",
    subtitle: "Pick all that feel right. No wrong answers!",
    options: [
      { label: "Playful & colorful", emoji: "🌈" },
      { label: "Soft & cozy", emoji: "☁️" },
      { label: "Mini adult", emoji: "👔" },
      { label: "Sporty & active", emoji: "⚽" },
      { label: "Earthy & organic", emoji: "🌿" },
      { label: "Bold prints", emoji: "🐯" },
      { label: "Classic & preppy", emoji: "⛵" },
      { label: "Whimsical", emoji: "✨" },
    ],
  },
  {
    id: "priorities",
    type: "multi",
    title: "What matters most to you?",
    subtitle: "We'll make sure every piece checks these boxes.",
    options: [
      { label: "Easy on / easy off", emoji: "👋" },
      { label: "Machine washable", emoji: "🧺" },
      { label: "Soft fabrics", emoji: "🤗" },
      { label: "Durability", emoji: "💪" },
      { label: "Organic / non-toxic", emoji: "🌱" },
      { label: "UV protection", emoji: "☀️" },
      { label: "Stain resistant", emoji: "🛡️" },
      { label: "Cute for photos", emoji: "📸" },
    ],
  },
  {
    id: "occasions",
    type: "multi",
    title: "What do they need outfits for?",
    subtitle: "Select all that apply.",
    options: [
      { label: "Everyday play", emoji: "🎪" },
      { label: "Daycare", emoji: "🏫" },
      { label: "Family outings", emoji: "👨‍👩‍👧" },
      { label: "Special occasions", emoji: "🎂" },
      { label: "Outdoor adventures", emoji: "🌳" },
      { label: "Sleepwear", emoji: "🌙" },
    ],
  },
  {
    id: "avoid",
    type: "multi",
    title: "Anything to avoid?",
    subtitle: "Totally optional — skip if nothing comes to mind.",
    options: [
      { label: "Buttons (choking hazard)", emoji: "🚫" },
      { label: "Scratchy tags", emoji: "😣" },
      { label: "Snaps at the back", emoji: "❌" },
      { label: "Character prints", emoji: "🦸" },
      { label: "Bright neon colors", emoji: "💡" },
      { label: "Denim", emoji: "👖" },
    ],
  },
  {
    id: "budget",
    type: "single",
    title: "What's your budget per piece?",
    subtitle: "We'll keep every item within your comfort zone.",
    options: [
      { label: "Under $20", emoji: "💚" },
      { label: "$20–$40", emoji: "💛" },
      { label: "$40–$60", emoji: "🧡" },
      { label: "$60+", emoji: "💜" },
    ],
  },
  {
    id: "frequency",
    type: "single",
    title: "How often should we send a box?",
    subtitle: "Growing fast? Monthly might be your jam. No commitment either way.",
    options: [
      { label: "Monthly", emoji: "📦" },
      { label: "Every other month", emoji: "📅" },
      { label: "Every 3 months", emoji: "🗓️" },
      { label: "Just once for now", emoji: "🎁" },
    ],
  },
  {
    id: "complete",
    type: "complete",
    title: "All set!",
    subtitle: "We can't wait to style your little one. Their first box is on the way!",
  },
];

const palette = {
  bg: "#FFF9F5",
  card: "#FFFFFF",
  accent: "#3B3B3B",
  soft: "#F0E8E0",
  softHover: "#E6DCD2",
  text: "#3B3B3B",
  textMuted: "#9B9490",
  textLight: "#C0B8B0",
  peach: "#F4A98A",
  peachSoft: "#FDE8DE",
  mint: "#7EBAA8",
  mintSoft: "#E2F0EB",
  lavender: "#B8A9D4",
  lavenderSoft: "#EDE8F5",
  border: "#F0E8E0",
  selected: "#3B3B3B",
  selectedText: "#FFFFFF",
  warmWhite: "#FFFCF9",
};

export default function KidsStyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animKey, setAnimKey] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_URL;
    document.head.appendChild(link);

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes float {
        from { transform: translate(0, 0) rotate(0deg); }
        to { transform: translate(15px, -15px) rotate(3deg); }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-2deg); }
        75% { transform: rotate(2deg); }
      }
      @keyframes pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.06); }
        100% { transform: scale(1); }
      }
      input::placeholder { color: ${palette.textLight}; }
      input:focus { border-bottom-color: ${palette.peach} !important; }
      button:hover { opacity: 0.88; }
      *::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    if (STEPS[step]?.type === "text" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const current = STEPS[step];
  const totalSteps = STEPS.length;
  const progress = (step / (totalSteps - 1)) * 100;

  const goNext = () => {
    if (step < totalSteps - 1) {
      setAnimKey((k) => k + 1);
      setStep((s) => s + 1);
    }
  };
  const goBack = () => {
    if (step > 0) {
      setAnimKey((k) => k + 1);
      setStep((s) => s - 1);
    }
  };

  const selectSingle = (val) => {
    setAnswers((a) => ({ ...a, [current.id]: val }));
    setTimeout(goNext, 350);
  };

  const toggleMulti = (val) => {
    setAnswers((a) => {
      const prev = a[current.id] || [];
      return {
        ...a,
        [current.id]: prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
      };
    });
  };

  const selectSize = (row, val) => {
    setAnswers((a) => ({
      ...a,
      sizes: { ...(a.sizes || {}), [row]: val },
    }));
  };

  const canProceed = () => {
    if (current.type === "text") return (answers[current.id] || "").trim().length > 0;
    if (current.type === "multi") return true;
    if (current.type === "multi-row") {
      const sizes = answers.sizes || {};
      return current.rows.every((r) => sizes[r.label]);
    }
    return true;
  };

  const childName = answers.child_name || "your little one";

  const renderStep = () => {
    if (current.type === "welcome") {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16, animation: "wiggle 2s ease-in-out infinite" }}>
            👶
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: palette.peach,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}>
            TRENDSEND KIDS
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 40,
            fontWeight: 500,
            lineHeight: 1.15,
            marginBottom: 12,
            color: palette.text,
          }}>
            {current.title}
          </h1>
          <p style={{
            fontSize: 16,
            color: palette.textMuted,
            lineHeight: 1.6,
            marginBottom: 36,
            fontWeight: 300,
            maxWidth: 400,
            margin: "0 auto 36px",
          }}>
            {current.subtitle}
          </p>
          <button
            onClick={goNext}
            style={{
              padding: "16px 44px",
              border: "none",
              borderRadius: 100,
              background: palette.peach,
              color: "#fff",
              fontSize: 16,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.3s ease",
              letterSpacing: "0.03em",
            }}
          >
            Let's go!
          </button>
        </div>
      );
    }

    if (current.type === "complete") {
      const vibes = answers.style_vibe || [];
      const priorities = answers.priorities || [];
      const occasions = answers.occasions || [];
      const avoidList = answers.avoid || [];
      const sizes = answers.sizes || {};

      return (
        <div>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: "pop 0.5s ease" }}>🎉</div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 500,
              marginBottom: 8,
            }}>
              {current.title}
            </h1>
            <p style={{ fontSize: 15, color: palette.textMuted, fontWeight: 300, lineHeight: 1.5 }}>
              {childName}'s style profile is ready. {current.subtitle}
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 24,
          }}>
            {[
              { label: "Child", value: `${childName}, ${answers.child_age || "—"}`, bg: palette.peachSoft, color: palette.peach },
              { label: "Shopping for", value: answers.child_gender || "—", bg: palette.lavenderSoft, color: palette.lavender },
              { label: "Style vibes", value: vibes.join(", ") || "—", bg: palette.mintSoft, color: palette.mint },
              { label: "Budget", value: answers.budget || "—", bg: palette.peachSoft, color: palette.peach },
              { label: "Priorities", value: priorities.join(", ") || "—", bg: palette.mintSoft, color: palette.mint },
              { label: "Occasions", value: occasions.join(", ") || "—", bg: palette.lavenderSoft, color: palette.lavender },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "14px 16px",
                background: item.bg,
                borderRadius: 12,
                animation: `fadeUp 0.4s ease forwards`,
                animationDelay: `${i * 0.06}s`,
                opacity: 0,
                animationFillMode: "forwards",
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: item.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 4,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: palette.text, lineHeight: 1.4 }}>
                  {item.value}
                </div>
              </div>
            ))}

            {avoidList.length > 0 && (
              <div style={{
                gridColumn: "1 / -1",
                padding: "14px 16px",
                background: "#FFF0F0",
                borderRadius: 12,
                animation: `fadeUp 0.4s ease forwards`,
                animationDelay: "0.36s",
                opacity: 0,
                animationFillMode: "forwards",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#D4836A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Avoiding
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: palette.text }}>
                  {avoidList.join(", ")}
                </div>
              </div>
            )}

            <div style={{
              gridColumn: "1 / -1",
              padding: "14px 16px",
              background: palette.warmWhite,
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
              animation: `fadeUp 0.4s ease forwards`,
              animationDelay: "0.42s",
              opacity: 0,
              animationFillMode: "forwards",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: palette.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Sizes
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: palette.text }}>
                {Object.entries(sizes).map(([k, v]) => `${k}: ${v}`).join(" · ") || "—"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => { setStep(0); setAnswers({}); setAnimKey((k) => k + 1); }}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 100,
                border: `1.5px solid ${palette.border}`,
                background: "transparent",
                color: palette.text,
                fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start over
            </button>
            <button
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: 100,
                border: "none",
                background: palette.peach,
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Get my first box!
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32,
          fontWeight: 500,
          lineHeight: 1.2,
          marginBottom: 8,
          color: palette.text,
        }}>
          {current.title.replace("{child}", childName)}
        </h1>
        <p style={{
          fontSize: 15,
          color: palette.textMuted,
          lineHeight: 1.5,
          marginBottom: 30,
          fontWeight: 300,
        }}>
          {current.subtitle}
        </p>

        {current.type === "text" && (
          <input
            ref={inputRef}
            type="text"
            placeholder={current.placeholder}
            value={answers[current.id] || ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [current.id]: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && canProceed() && goNext()}
            style={{
              width: "100%",
              padding: "16px 0",
              border: "none",
              borderBottom: `2px solid ${palette.soft}`,
              background: "transparent",
              fontSize: 22,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 400,
              color: palette.text,
              outline: "none",
              transition: "border-color 0.3s ease",
            }}
          />
        )}

        {current.type === "single" && current.options.map((opt) => {
          const label = typeof opt === "string" ? opt : opt.label;
          const emoji = typeof opt === "string" ? null : opt.emoji;
          const isSelected = answers[current.id] === label;

          return (
            <button
              key={label}
              onClick={() => selectSingle(label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "15px 20px",
                marginBottom: 10,
                border: `1.5px solid ${isSelected ? palette.selected : palette.border}`,
                borderRadius: 12,
                background: isSelected ? palette.selected : palette.card,
                color: isSelected ? palette.selectedText : palette.text,
                fontSize: 15,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: isSelected ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.25s ease",
                textAlign: "left",
              }}
            >
              {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
              {label}
            </button>
          );
        })}

        {current.type === "multi" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {current.options.map((opt) => {
              const isSelected = (answers[current.id] || []).includes(opt.label);
              return (
                <button
                  key={opt.label}
                  onClick={() => toggleMulti(opt.label)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 18px",
                    border: `1.5px solid ${isSelected ? palette.selected : palette.border}`,
                    borderRadius: 100,
                    background: isSelected ? palette.selected : palette.card,
                    color: isSelected ? palette.selectedText : palette.text,
                    fontSize: 14,
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: isSelected ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    animation: isSelected ? "pop 0.25s ease" : "none",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {current.type === "multi-row" && current.rows.map((row) => (
          <div key={row.label} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: palette.textMuted,
              marginBottom: 8,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              {row.label}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {row.options.map((opt) => {
                const isSelected = (answers.sizes || {})[row.label] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => selectSize(row.label, opt)}
                    style={{
                      padding: "9px 14px",
                      border: `1.5px solid ${isSelected ? palette.selected : palette.border}`,
                      borderRadius: 8,
                      background: isSelected ? palette.selected : palette.card,
                      color: isSelected ? palette.selectedText : palette.text,
                      fontSize: 13,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      minWidth: 44,
                      textAlign: "center",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 24,
        }}>
          {step > 1 ? (
            <button
              onClick={goBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 0",
                border: "none",
                background: "transparent",
                color: palette.textMuted,
                fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 400,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          ) : <div />}
          {current.type !== "single" && (
            <button
              disabled={!canProceed()}
              onClick={goNext}
              style={{
                padding: "14px 36px",
                border: "none",
                borderRadius: 100,
                background: canProceed() ? palette.peach : palette.soft,
                color: canProceed() ? "#fff" : palette.textMuted,
                fontSize: 15,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                cursor: canProceed() ? "pointer" : "not-allowed",
                transition: "all 0.3s ease",
                letterSpacing: "0.03em",
              }}
            >
              {current.id === "avoid" ? "Skip / Continue →" : "Continue →"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: palette.bg,
      fontFamily: "'Nunito', sans-serif",
      color: palette.text,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: palette.peachSoft, top: "-5%", left: "-8%",
        opacity: 0.5, filter: "blur(60px)",
        animation: "float 7s ease-in-out infinite alternate",
      }} />
      <div style={{
        position: "absolute", width: 250, height: 250, borderRadius: "50%",
        background: palette.mintSoft, bottom: "10%", right: "-5%",
        opacity: 0.5, filter: "blur(60px)",
        animation: "float 8s ease-in-out infinite alternate",
        animationDelay: "2s",
      }} />
      <div style={{
        position: "absolute", width: 200, height: 200, borderRadius: "50%",
        background: palette.lavenderSoft, top: "40%", left: "80%",
        opacity: 0.4, filter: "blur(60px)",
        animation: "float 9s ease-in-out infinite alternate",
        animationDelay: "4s",
      }} />

      <div style={{ width: "100%", maxWidth: 540, position: "relative", zIndex: 2 }}>
        {step > 0 && step < totalSteps - 1 && (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 500,
                color: palette.text,
                letterSpacing: "0.02em",
              }}>
                <span style={{ color: palette.peach }}>TRENDSEND</span> <span style={{ fontSize: 16, color: palette.textLight }}>kids</span>
              </div>
              <div style={{
                fontSize: 13,
                color: palette.textMuted,
                fontWeight: 400,
              }}>
                {step} of {totalSteps - 2}
              </div>
            </div>
            <div style={{
              width: "100%",
              height: 3,
              background: palette.soft,
              borderRadius: 2,
              marginBottom: 40,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${palette.peach}, ${palette.mint})`,
                borderRadius: 2,
                transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              }} />
            </div>
          </>
        )}

        <div key={animKey} style={{ animation: "fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
