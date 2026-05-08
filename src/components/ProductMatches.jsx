import { useState, useEffect } from "react";
import { fetchAllProducts, matchProducts } from "../lib/shopify-quiz-matcher";
import recommendationsConfig, { prepareAnswers } from "../config/recommendations";
import palette from "../lib/palette";

function formatPrice(price, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(price);
}

function ProductCard({ product }) {
  return (
    <div style={{
      background: palette.card,
      border: `1px solid ${palette.border}`,
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ width: "100%", height: 180, background: palette.soft, overflow: "hidden", flexShrink: 0 }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}>
            👕
          </div>
        )}
      </div>

      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: palette.text,
          lineHeight: 1.35,
          fontFamily: "'Nunito', sans-serif",
        }}>
          {product.title}
        </div>

        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: palette.peach,
          fontFamily: "'Nunito', sans-serif",
          marginTop: "auto",
        }}>
          {formatPrice(product.price, product.currency)}
        </div>

        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "9px 0",
            borderRadius: 100,
            background: palette.peach,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Nunito', sans-serif",
            textDecoration: "none",
            letterSpacing: "0.02em",
          }}
        >
          View product
        </a>
      </div>
    </div>
  );
}

export default function ProductMatches({ answers, onStartOver }) {
  const [status, setStatus] = useState("loading");
  const [products, setProducts] = useState([]);
  const [retryKey, setRetryKey] = useState(0);

  const childName = answers.child_name || "your little one";

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchAllProducts({
      domain: import.meta.env.VITE_SHOPIFY_DOMAIN,
      storefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
    })
      .then((all) => {
        if (cancelled) return;
        if (all.length === 0) {
          setStatus("error");
          return;
        }
        const matches = matchProducts(all, prepareAnswers(answers), recommendationsConfig);
        if (matches.length === 0) {
          setStatus("empty");
        } else {
          setProducts(matches);
          setStatus("ok");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => { cancelled = true; };
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const containerStyle = {
    marginTop: 32,
    fontFamily: "'Nunito', sans-serif",
  };

  const dividerStyle = {
    width: "100%",
    height: 1,
    background: palette.border,
    marginBottom: 28,
  };

  if (status === "loading") {
    return (
      <div style={containerStyle}>
        <div style={dividerStyle} />
        <div style={{ textAlign: "center", padding: "32px 0", color: palette.textMuted, fontSize: 15 }}>
          Finding the best picks for {childName}…
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={containerStyle}>
        <div style={dividerStyle} />
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 14, color: palette.textMuted, marginBottom: 16 }}>
            Couldn't load products right now.
          </div>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            style={{
              padding: "12px 28px",
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
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div style={containerStyle}>
        <div style={dividerStyle} />
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 14, color: palette.textMuted, marginBottom: 16 }}>
            No products matched {childName}'s profile right now.
          </div>
          <button
            onClick={onStartOver}
            style={{
              padding: "12px 28px",
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
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={dividerStyle} />
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: palette.peach,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}>
        Your matches
      </div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22,
        fontWeight: 500,
        color: palette.text,
        marginBottom: 20,
      }}>
        Perfect picks for {childName}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
      }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
