// SymbolPopup.js
import React, { useState, useEffect, useRef } from "react";
import { SYMBOL_GROUPS } from "../../core/symbols";

export default function SymbolPopup({ open, onClose, onSelectSymbol, anchorRect }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Greek");
  const [recentSymbols, setRecentSymbols] = useState(() => {
    try {
      const saved = localStorage.getItem("pdp_recent_symbols");
      return saved ? JSON.parse(saved) : ["α", "β", "γ", "±", "√", "∞", "€"];
    } catch {
      return ["α", "β", "γ", "±", "√", "∞", "€"];
    }
  });

  const popupRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSymbolClick = (symbol) => {
    onSelectSymbol(symbol);

    setRecentSymbols((prev) => {
      const next = [symbol, ...prev.filter((s) => s !== symbol)].slice(0, 16);
      try {
        localStorage.setItem("pdp_recent_symbols", JSON.stringify(next));
      } catch {}
      return next;
    });

    onClose();
  };

  const groups = SYMBOL_GROUPS.map((g) =>
    g.name === "Recently used" ? { ...g, symbols: recentSymbols } : g
  );

  const currentGroup = groups.find((g) => g.name === activeCategory) || groups[1];

  let displayedSymbols = currentGroup.symbols;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    const allSymbols = Array.from(new Set(groups.flatMap((g) => g.symbols)));
    displayedSymbols = allSymbols.filter((s) => s.toLowerCase().includes(q));
  }

  return (
    <div className="re-symbol-popup" ref={popupRef}>
      <div className="re-symbol-header">
        <input
          type="text"
          className="re-symbol-search"
          placeholder="Search symbols..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        <button type="button" className="re-symbol-close" onClick={onClose}>
          ✕
        </button>
      </div>

      {!search.trim() && (
        <div className="re-symbol-tabs">
          {groups.map((g) => (
            <button
              key={g.name}
              type="button"
              className={["re-symbol-tab", activeCategory === g.name ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => setActiveCategory(g.name)}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      <div className="re-symbol-grid">
        {displayedSymbols.map((sym, idx) => (
          <button
            key={`${sym}-${idx}`}
            type="button"
            className="re-symbol-item"
            onClick={() => handleSymbolClick(sym)}
            title={sym}
          >
            {sym}
          </button>
        ))}
        {displayedSymbols.length === 0 && (
          <div className="re-symbol-empty">No symbols found</div>
        )}
      </div>
    </div>
  );
}
