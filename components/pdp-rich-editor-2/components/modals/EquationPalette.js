// EquationPalette.js
import React, { useState } from "react";
import {
  createFractionNode,
  createSuperscriptNode,
  createSubscriptNode,
  createSubSuperscriptNode,
  createSqrtNode,
  createIntegralNode,
  createSummationNode,
  createMatrixNode,
  createBracketNode,
  createIdentifierNode,
  createOperatorNode,
} from "../../math/equationAst";

export const STRUCTURE_ITEMS = [
  { label: "Fraction", sub: "a / b", icon: "½", create: () => createFractionNode() },
  { label: "Exponent", sub: "x²", icon: "x²", create: () => createSuperscriptNode() },
  { label: "Subscript", sub: "x₁", icon: "x₁", create: () => createSubscriptNode() },
  { label: "Sub & Sup", sub: "x₁²", icon: "x₁²", create: () => createSubSuperscriptNode() },
  { label: "Square Root", sub: "√x", icon: "√", create: () => createSqrtNode() },
  { label: "Integral", sub: "∫ dx", icon: "∫", create: () => createIntegralNode() },
  { label: "Summation", sub: "∑ n", icon: "∑", create: () => createSummationNode() },
  { label: "Brackets", sub: "(x)", icon: "( )", create: () => createBracketNode("(", ")") },
  { label: "Matrix", sub: "2×2", icon: "[ ]", create: () => createMatrixNode(2, 2) },
];

export const OPERATOR_ITEMS = [
  { label: "+", create: () => createOperatorNode("+") },
  { label: "-", create: () => createOperatorNode("-") },
  { label: "×", create: () => createOperatorNode("×") },
  { label: "÷", create: () => createOperatorNode("÷") },
  { label: "=", create: () => createOperatorNode("=") },
  { label: "≠", create: () => createOperatorNode("≠") },
  { label: "±", create: () => createOperatorNode("±") },
  { label: "≤", create: () => createOperatorNode("≤") },
  { label: "≥", create: () => createOperatorNode("≥") },
  { label: "≈", create: () => createOperatorNode("≈") },
  { label: "∞", create: () => createIdentifierNode("∞") },
  { label: "∂", create: () => createIdentifierNode("∂") },
  { label: "∇", create: () => createIdentifierNode("∇") },
];

export const GREEK_ITEMS = [
  "α", "β", "γ", "δ", "ε", "θ", "λ", "μ",
  "π", "ρ", "σ", "φ", "ψ", "ω", "Γ", "Δ", "Θ", "Ω",
];

export default function EquationPalette({ onInsertNode }) {
  const [tab, setTab] = useState("structures");

  return (
    <div className="re-eq-palette-tabs">
      <div className="re-eq-tabs-header">
        <button
          type="button"
          className={["re-eq-tab-btn", tab === "structures" ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={() => setTab("structures")}
        >
          Math Structures
        </button>
        <button
          type="button"
          className={["re-eq-tab-btn", tab === "operators" ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={() => setTab("operators")}
        >
          Operators & Symbols
        </button>
        <button
          type="button"
          className={["re-eq-tab-btn", tab === "greek" ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={() => setTab("greek")}
        >
          Greek Letters
        </button>
      </div>

      <div className="re-eq-tabs-content">
        {tab === "structures" && (
          <div className="re-eq-structures-grid">
            {STRUCTURE_ITEMS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="re-eq-structure-card"
                onClick={() => onInsertNode(item.create())}
              >
                <span className="re-eq-structure-card__icon">{item.icon}</span>
                <span className="re-eq-structure-card__label">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "operators" && (
          <div className="re-eq-symbol-grid">
            {OPERATOR_ITEMS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="re-eq-symbol-btn"
                onClick={() => onInsertNode(item.create())}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {tab === "greek" && (
          <div className="re-eq-symbol-grid">
            {GREEK_ITEMS.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                className="re-eq-symbol-btn"
                onClick={() => onInsertNode(createIdentifierNode(sym))}
              >
                {sym}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
