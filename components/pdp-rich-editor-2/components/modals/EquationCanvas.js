// EquationCanvas.js
import React from "react";
import { EquationView } from "../../math/renderMathML";

export default function EquationCanvas({
  ast,
  activeSlotId,
  onSelectSlot,
  onUpdateSlotText,
  linearInput,
  onLinearInputChange,
  onKeyDown,
  onClear,
}) {
  const hasContent = ast && (ast.type !== "row" || (ast.children && ast.children.length > 0));

  return (
    <div className="re-eq-canvas-wrapper">
      <div className="re-eq-preview-header">
        <span className="re-eq-preview-label">Live Equation Preview (Click any box to type inside)</span>
        {hasContent && (
          <button type="button" className="re-eq-clear-btn" onClick={onClear}>
            Reset
          </button>
        )}
      </div>

      <div className="re-eq-canvas-box" onClick={() => onSelectSlot(null)}>
        <EquationView
          equation={{ display: "block", ast }}
          activeSlotId={activeSlotId}
          onSelectSlot={onSelectSlot}
          onUpdateSlotText={onUpdateSlotText}
        />
      </div>

      <div className="re-eq-type-box">
        <label className="re-eq-type-label">Or Type Active Slot Text:</label>
        <input
          type="text"
          className="re-eq-type-input"
          placeholder="Type text for active slot here..."
          value={linearInput}
          onChange={(e) => onLinearInputChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="re-eq-tips">
          <span>Press <code>Tab</code> to move to the next box in the equation.</span>
        </div>
      </div>
    </div>
  );
}
