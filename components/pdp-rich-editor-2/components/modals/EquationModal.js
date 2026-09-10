// EquationModal.js
import React, { useState, useEffect } from "react";
import EquationPalette from "./EquationPalette";
import EquationCanvas from "./EquationCanvas";
import {
  createRowNode,
  createSlotNode,
  astToPlainText,
} from "../../math/equationAst";

export default function EquationModal({ open, initialEquation, onClose, onSubmit }) {
  const createEmptyAst = () => {
    const initialSlot = createSlotNode(null, "start");
    return createRowNode([initialSlot]);
  };

  const [ast, setAst] = useState(createEmptyAst);
  const [activeSlotId, setActiveSlotId] = useState(null);
  const [linearInput, setLinearInput] = useState("");
  const [display, setDisplay] = useState("inline");

  useEffect(() => {
    if (open) {
      setDisplay(initialEquation?.display || "inline");

      if (initialEquation?.ast) {
        setAst(initialEquation.ast);
        const all = collectSlots(initialEquation.ast);
        if (all.length > 0) {
          setActiveSlotId(all[0].id);
          setLinearInput(all[0].value || "");
        } else {
          setActiveSlotId(null);
          setLinearInput("");
        }
      } else {
        const initial = createEmptyAst();
        setAst(initial);
        if (initial.children && initial.children[0]) {
          setActiveSlotId(initial.children[0].id);
          setLinearInput("");
        }
      }
    }
  }, [open, initialEquation]);

  if (!open) return null;

  const collectSlots = (node, acc = []) => {
    if (!node) return acc;
    if (node.type === "slot" || node.type === "identifier" || node.type === "number" || node.type === "operator") {
      acc.push(node);
      return acc;
    }
    if (node.type === "row") {
      (node.children || []).forEach((child) => collectSlots(child, acc));
    } else if (node.type === "fraction") {
      collectSlots(node.numerator, acc);
      collectSlots(node.denominator, acc);
    } else if (node.type === "superscript") {
      collectSlots(node.base, acc);
      collectSlots(node.exponent, acc);
    } else if (node.type === "subscript") {
      collectSlots(node.base, acc);
      collectSlots(node.subscript, acc);
    } else if (node.type === "subsup") {
      collectSlots(node.base, acc);
      collectSlots(node.subscript, acc);
      collectSlots(node.exponent, acc);
    } else if (node.type === "sqrt") {
      collectSlots(node.value, acc);
    } else if (node.type === "integral" || node.type === "summation") {
      collectSlots(node.lower, acc);
      collectSlots(node.upper, acc);
      collectSlots(node.body, acc);
    } else if (node.type === "matrix") {
      (node.rows || []).forEach((row) => row.forEach((cell) => collectSlots(cell, acc)));
    } else if (node.type === "bracket") {
      collectSlots(node.body, acc);
    }
    return acc;
  };

  const slots = collectSlots(ast);

  const handleSelectSlot = (slotId) => {
    setActiveSlotId(slotId);
    const target = slots.find((s) => s.id === slotId);
    setLinearInput(target?.value || "");
  };

  const navigateSlot = (direction = 1) => {
    if (!slots.length) return;
    const currentIndex = slots.findIndex((s) => s.id === activeSlotId);
    if (currentIndex === -1) {
      handleSelectSlot(slots[0].id);
      return;
    }
    const nextIndex = (currentIndex + direction + slots.length) % slots.length;
    handleSelectSlot(slots[nextIndex].id);
  };

  const updateSlotTextInTree = (node, slotId, newText) => {
    if (!node) return node;

    if (node.id === slotId) {
      return { ...node, value: newText };
    }

    if (node.type === "row") {
      return {
        ...node,
        children: (node.children || []).map((child) =>
          updateSlotTextInTree(child, slotId, newText)
        ),
      };
    }

    if (node.type === "fraction") {
      return {
        ...node,
        numerator: updateSlotTextInTree(node.numerator, slotId, newText),
        denominator: updateSlotTextInTree(node.denominator, slotId, newText),
      };
    }

    if (node.type === "superscript") {
      return {
        ...node,
        base: updateSlotTextInTree(node.base, slotId, newText),
        exponent: updateSlotTextInTree(node.exponent, slotId, newText),
      };
    }

    if (node.type === "subscript") {
      return {
        ...node,
        base: updateSlotTextInTree(node.base, slotId, newText),
        subscript: updateSlotTextInTree(node.subscript, slotId, newText),
      };
    }

    if (node.type === "subsup") {
      return {
        ...node,
        base: updateSlotTextInTree(node.base, slotId, newText),
        subscript: updateSlotTextInTree(node.subscript, slotId, newText),
        exponent: updateSlotTextInTree(node.exponent, slotId, newText),
      };
    }

    if (node.type === "sqrt") {
      return {
        ...node,
        value: updateSlotTextInTree(node.value, slotId, newText),
      };
    }

    if (node.type === "integral" || node.type === "summation") {
      return {
        ...node,
        lower: updateSlotTextInTree(node.lower, slotId, newText),
        upper: updateSlotTextInTree(node.upper, slotId, newText),
        body: updateSlotTextInTree(node.body, slotId, newText),
      };
    }

    if (node.type === "matrix") {
      return {
        ...node,
        rows: (node.rows || []).map((row) =>
          row.map((cell) => updateSlotTextInTree(cell, slotId, newText))
        ),
      };
    }

    if (node.type === "bracket") {
      return {
        ...node,
        body: updateSlotTextInTree(node.body, slotId, newText),
      };
    }

    return node;
  };

  const handleUpdateSlotText = (slotId, newText) => {
    if (!slotId) return;
    const updated = updateSlotTextInTree(ast, slotId, newText);
    setAst(updated);
  };

  const replaceSlotInTree = (node, slotId, replacement) => {
    if (!node) return node;

    if (node.id === slotId) {
      return replacement;
    }

    if (node.type === "row") {
      const newChildren = (node.children || []).map((child) => {
        if (child.id === slotId) {
          return replacement;
        }
        return replaceSlotInTree(child, slotId, replacement);
      });
      return { ...node, children: newChildren };
    }

    if (node.type === "fraction") {
      return {
        ...node,
        numerator: replaceSlotInTree(node.numerator, slotId, replacement),
        denominator: replaceSlotInTree(node.denominator, slotId, replacement),
      };
    }

    if (node.type === "superscript") {
      return {
        ...node,
        base: replaceSlotInTree(node.base, slotId, replacement),
        exponent: replaceSlotInTree(node.exponent, slotId, replacement),
      };
    }

    if (node.type === "subscript") {
      return {
        ...node,
        base: replaceSlotInTree(node.base, slotId, replacement),
        subscript: replaceSlotInTree(node.subscript, slotId, replacement),
      };
    }

    if (node.type === "subsup") {
      return {
        ...node,
        base: replaceSlotInTree(node.base, slotId, replacement),
        subscript: replaceSlotInTree(node.subscript, slotId, replacement),
        exponent: replaceSlotInTree(node.exponent, slotId, replacement),
      };
    }

    if (node.type === "sqrt") {
      return {
        ...node,
        value: replaceSlotInTree(node.value, slotId, replacement),
      };
    }

    if (node.type === "integral" || node.type === "summation") {
      return {
        ...node,
        lower: replaceSlotInTree(node.lower, slotId, replacement),
        upper: replaceSlotInTree(node.upper, slotId, replacement),
        body: replaceSlotInTree(node.body, slotId, replacement),
      };
    }

    if (node.type === "matrix") {
      return {
        ...node,
        rows: (node.rows || []).map((row) =>
          row.map((cell) => replaceSlotInTree(cell, slotId, replacement))
        ),
      };
    }

    if (node.type === "bracket") {
      return {
        ...node,
        body: replaceSlotInTree(node.body, slotId, replacement),
      };
    }

    return node;
  };

  const handleInsertNode = (newNode) => {
    let targetSlot = activeSlotId;
    if (!targetSlot && slots.length > 0) {
      targetSlot = slots[slots.length - 1].id;
    }

    if (targetSlot) {
      const updatedAst = replaceSlotInTree(ast, targetSlot, newNode);
      setAst(updatedAst);

      const newSlots = collectSlots(updatedAst);
      if (newSlots.length > 0) {
        const nextSlot = newSlots.find((s) => s.id !== targetSlot) || newSlots[0];
        handleSelectSlot(nextSlot.id);
      } else {
        setActiveSlotId(null);
        setLinearInput("");
      }
    } else {
      if (ast.type === "row") {
        setAst({ ...ast, children: [...(ast.children || []), newNode] });
      } else {
        setAst(createRowNode([ast, newNode]));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      navigateSlot(e.shiftKey ? -1 : 1);
    }
  };

  const handleReset = () => {
    const initial = createEmptyAst();
    setAst(initial);
    if (initial.children && initial.children[0]) {
      handleSelectSlot(initial.children[0].id);
    } else {
      setLinearInput("");
    }
  };

  const handleSubmit = () => {
    const source = astToPlainText(ast) || "Equation";
    onSubmit({
      id: initialEquation?.id,
      display,
      source,
      ast,
    });
    onClose();
  };

  return (
    <div className="re-modal-overlay" onClick={onClose}>
      <div className="re-modal re-modal--equation" onClick={(e) => e.stopPropagation()}>
        <div className="re-modal__header">
          <h3>{initialEquation ? "Edit Equation" : "Insert Equation"}</h3>
          <button type="button" className="re-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="re-modal__body re-eq-editor-simplified">
          <div className="re-eq-display-toggle">
            <span>Layout Position:</span>
            <button
              type="button"
              className={["re-eq-toggle-btn", display === "block" ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => setDisplay("block")}
            >
              Centered Block
            </button>
            <button
              type="button"
              className={["re-eq-toggle-btn", display === "inline" ? "is-active" : ""].filter(Boolean).join(" ")}
              onClick={() => setDisplay("inline")}
            >
              Inline with Text
            </button>
          </div>

          <EquationCanvas
            ast={ast}
            activeSlotId={activeSlotId}
            onSelectSlot={handleSelectSlot}
            onUpdateSlotText={(id, text) => {
              handleUpdateSlotText(id, text);
              setLinearInput(text);
            }}
            linearInput={linearInput}
            onLinearInputChange={(val) => {
              setLinearInput(val);
              if (activeSlotId) {
                handleUpdateSlotText(activeSlotId, val);
              }
            }}
            onKeyDown={handleKeyDown}
            onClear={handleReset}
          />

          <EquationPalette onInsertNode={handleInsertNode} />
        </div>

        <div className="re-modal__footer">
          <button type="button" className="re-btn re-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="re-btn re-btn--primary" onClick={handleSubmit}>
            {initialEquation ? "Update Equation" : "Insert Equation"}
          </button>
        </div>
      </div>
    </div>
  );
}
