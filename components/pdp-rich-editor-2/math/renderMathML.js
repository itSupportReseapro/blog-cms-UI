// math/renderMathML.js
import React from "react";

export function MathNode({ node, activeSlotId, onSelectSlot, onUpdateSlotText }) {
  if (!node) {
    return <mrow />;
  }

  const isSelected = activeSlotId === node.id;

  switch (node.type) {
    case "identifier":
      return (
        <mi
          className={isSelected ? "is-selected-node" : ""}
          onClick={(e) => {
            if (onSelectSlot) {
              e.stopPropagation();
              onSelectSlot(node.id);
            }
          }}
        >
          {node.value}
        </mi>
      );

    case "number":
      return (
        <mn
          className={isSelected ? "is-selected-node" : ""}
          onClick={(e) => {
            if (onSelectSlot) {
              e.stopPropagation();
              onSelectSlot(node.id);
            }
          }}
        >
          {node.value}
        </mn>
      );

    case "operator":
      return (
        <mo
          className={isSelected ? "is-selected-node" : ""}
          onClick={(e) => {
            if (onSelectSlot) {
              e.stopPropagation();
              onSelectSlot(node.id);
            }
          }}
        >
          {node.value}
        </mo>
      );

    case "text":
      return <mtext>{node.value}</mtext>;

    case "slot": {
      return (
        <mtext
          className={["re-math-slot", isSelected ? "is-active" : ""].filter(Boolean).join(" ")}
          onClick={(e) => {
            if (onSelectSlot) {
              e.stopPropagation();
              onSelectSlot(node.id);
            }
          }}
        >
          {isSelected && onUpdateSlotText ? (
            <input
              type="text"
              className="re-math-slot-input"
              value={node.value || ""}
              onChange={(e) => onUpdateSlotText(node.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="⬚"
              autoFocus
            />
          ) : (
            node.value || "⬚"
          )}
        </mtext>
      );
    }

    case "row":
      return (
        <mrow>
          {(node.children || []).map((child, index) => (
            <MathNode
              key={index}
              node={child}
              activeSlotId={activeSlotId}
              onSelectSlot={onSelectSlot}
              onUpdateSlotText={onUpdateSlotText}
            />
          ))}
        </mrow>
      );

    case "fraction":
      return (
        <mfrac>
          <MathNode
            node={node.numerator}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
          <MathNode
            node={node.denominator}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </mfrac>
      );

    case "superscript":
      return (
        <msup>
          <MathNode
            node={node.base}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
          <MathNode
            node={node.exponent}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </msup>
      );

    case "subscript":
      return (
        <msub>
          <MathNode
            node={node.base}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
          <MathNode
            node={node.subscript}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </msub>
      );

    case "subsup":
      return (
        <msubsup>
          <MathNode
            node={node.base}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
          <MathNode
            node={node.subscript}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
          <MathNode
            node={node.exponent}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </msubsup>
      );

    case "sqrt":
      return (
        <msqrt>
          <MathNode
            node={node.value}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </msqrt>
      );

    case "integral":
      return (
        <mrow>
          <msubsup>
            <mo>∫</mo>
            <MathNode
              node={node.lower}
              activeSlotId={activeSlotId}
              onSelectSlot={onSelectSlot}
              onUpdateSlotText={onUpdateSlotText}
            />
            <MathNode
              node={node.upper}
              activeSlotId={activeSlotId}
              onSelectSlot={onSelectSlot}
              onUpdateSlotText={onUpdateSlotText}
            />
          </msubsup>
          <MathNode
            node={node.body}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </mrow>
      );

    case "summation":
      return (
        <mrow>
          <msubsup>
            <mo>∑</mo>
            <MathNode
              node={node.lower}
              activeSlotId={activeSlotId}
              onSelectSlot={onSelectSlot}
              onUpdateSlotText={onUpdateSlotText}
            />
            <MathNode
              node={node.upper}
              activeSlotId={activeSlotId}
              onSelectSlot={onSelectSlot}
              onUpdateSlotText={onUpdateSlotText}
            />
          </msubsup>
          <MathNode
            node={node.body}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </mrow>
      );

    case "matrix":
      return (
        <mfenced open="(" close=")">
          <mtable>
            {(node.rows || []).map((row, rowIndex) => (
              <mtr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <mtd key={cellIndex}>
                    <MathNode
                      node={cell}
                      activeSlotId={activeSlotId}
                      onSelectSlot={onSelectSlot}
                      onUpdateSlotText={onUpdateSlotText}
                    />
                  </mtd>
                ))}
              </mtr>
            ))}
          </mtable>
        </mfenced>
      );

    case "bracket":
      return (
        <mfenced open={node.open || "("} close={node.close || ")"}>
          <MathNode
            node={node.body}
            activeSlotId={activeSlotId}
            onSelectSlot={onSelectSlot}
            onUpdateSlotText={onUpdateSlotText}
          />
        </mfenced>
      );

    default:
      return <mtext />;
  }
}

export function EquationView({ equation, activeSlotId, onSelectSlot, onUpdateSlotText }) {
  if (!equation) return null;
  const display = equation.display === "inline" ? "inline" : "block";

  return (
    <math xmlns="http://www.w3.org/1998/Math/MathML" display={display}>
      <MathNode
        node={equation.ast}
        activeSlotId={activeSlotId}
        onSelectSlot={onSelectSlot}
        onUpdateSlotText={onUpdateSlotText}
      />
    </math>
  );
}

function escapeMathML(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function astToMathMLHTML(node) {
  if (!node) return "<mrow></mrow>";

  switch (node.type) {
    case "identifier":
      return `<mi>${escapeMathML(node.value)}</mi>`;
    case "number":
      return `<mn>${escapeMathML(node.value)}</mn>`;
    case "operator":
      return `<mo>${escapeMathML(node.value)}</mo>`;
    case "text":
      return `<mtext>${escapeMathML(node.value || "")}</mtext>`;
    case "slot": {
      const val = String(node.value || "").trim();
      if (!val) return `<mtext>⬚</mtext>`;
      if (/^\d+(?:\.\d+)?$/.test(val)) return `<mn>${escapeMathML(val)}</mn>`;
      if (/^[+\-×÷=≠±≤≥*/]+$/.test(val)) return `<mo>${escapeMathML(val)}</mo>`;
      return `<mi>${escapeMathML(val)}</mi>`;
    }
    case "row":
      return `<mrow>${(node.children || []).map(astToMathMLHTML).join("")}</mrow>`;
    case "fraction":
      return `<mfrac>${astToMathMLHTML(node.numerator)}${astToMathMLHTML(node.denominator)}</mfrac>`;
    case "superscript":
      return `<msup>${astToMathMLHTML(node.base)}${astToMathMLHTML(node.exponent)}</msup>`;
    case "subscript":
      return `<msub>${astToMathMLHTML(node.base)}${astToMathMLHTML(node.subscript)}</msub>`;
    case "subsup":
      return `<msubsup>${astToMathMLHTML(node.base)}${astToMathMLHTML(node.subscript)}${astToMathMLHTML(node.exponent)}</msubsup>`;
    case "sqrt":
      return `<msqrt>${astToMathMLHTML(node.value)}</msqrt>`;
    case "integral":
      return `<mrow><msubsup><mo>∫</mo>${astToMathMLHTML(node.lower)}${astToMathMLHTML(node.upper)}</msubsup>${astToMathMLHTML(node.body)}</mrow>`;
    case "summation":
      return `<mrow><msubsup><mo>∑</mo>${astToMathMLHTML(node.lower)}${astToMathMLHTML(node.upper)}</msubsup>${astToMathMLHTML(node.body)}</mrow>`;
    case "matrix": {
      const rows = (node.rows || [])
        .map(
          (row) =>
            `<mtr>${row.map((cell) => `<mtd>${astToMathMLHTML(cell)}</mtd>`).join("")}</mtr>`
        )
        .join("");
      return `<mfenced open="(" close=")"><mtable>${rows}</mtable></mfenced>`;
    }
    case "bracket":
      return `<mfenced open="${escapeMathML(node.open || "(")}" close="${escapeMathML(node.close || ")")}">${astToMathMLHTML(node.body)}</mfenced>`;
    default:
      return "<mtext></mtext>";
  }
}
