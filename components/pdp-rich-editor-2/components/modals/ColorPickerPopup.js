import React, { useEffect, useRef, useState } from "react";

// Standard 256 RGB palette grid preset colors (Vibrant spectrum + monochrome)
export const PALETTE_256 = [
  "#000000", "#1c1c1c", "#303030", "#444444", "#585858", "#6c6c6c", "#808080", "#949494", "#a8a8a8", "#bcbcbc", "#d0d0d0", "#e4e4e4", "#ffffff",
  "#800000", "#af0000", "#d70000", "#ff0000", "#ff5f5f", "#d75f5f", "#af5f5f", "#875f5f", "#ff8787", "#ffafaf", "#ffd7d7",
  "#805f00", "#af8700", "#d7a700", "#ffc700", "#ffff00", "#ffff5f", "#d7d75f", "#afaf5f", "#ffff87", "#ffffaf", "#ffffd7",
  "#008000", "#00af00", "#00d700", "#00ff00", "#5fff5f", "#5fd75f", "#5faf5f", "#5f875f", "#87ff87", "#afffaf", "#d7ffd7",
  "#008080", "#00afaf", "#00d7d7", "#00ffff", "#5ffff7", "#5fd7d7", "#5fafaf", "#5f8787", "#87ffff", "#afffff", "#d7ffff",
  "#000080", "#0000af", "#0000d7", "#0000ff", "#5f5fff", "#5f5fd7", "#5f5faf", "#5f5f87", "#8787ff", "#afafff", "#d7d7ff",
  "#800080", "#af00af", "#d700d7", "#ff00ff", "#ff5fff", "#ff5fd7", "#ff5faf", "#ff5f87", "#ff87ff", "#ffafff", "#ffd7ff",
  "#87005f", "#af005f", "#d7005f", "#ff005f", "#ff5f87", "#d75f87", "#af5f87", "#ff87af", "#ffafdf", "#ffd7ef",
];

function hexToRgb(hex) {
  if (!hex || hex === "__none__" || hex === "transparent") return { r: 0, g: 0, b: 0 };
  const cleanHex = hex.replace("#", "");
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(fullHex, 16);
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHexStr(r, g, b) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(Number(val) || 0)));
  const toHex = (val) => clamp(val).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function ColorWheel({ onSelectColor, currentColor }) {
  const canvasRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;

    ctx.clearRect(0, 0, width, height);

    for (let x = -radius; x < radius; x++) {
      for (let y = -radius; y < radius; y++) {
        const distance = Math.sqrt(x * x + y * y);
        if (distance <= radius) {
          const angle = Math.atan2(y, x);
          const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;
          const saturation = (distance / radius) * 100;
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, 50%)`;
          ctx.fillRect(x + radius, y + radius, 1, 1);
        }
      }
    }
  }, []);

  const handlePick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    const ctx = canvas.getContext("2d");
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      const hex = rgbToHexStr(pixel[0], pixel[1], pixel[2]);
      onSelectColor(hex);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", margin: "8px 0" }}>
      <canvas
        ref={canvasRef}
        width={130}
        height={130}
        style={{
          borderRadius: "50%",
          cursor: "crosshair",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          border: "2px solid #ffffff",
        }}
        onMouseDown={(e) => {
          isDragging.current = true;
          handlePick(e);
        }}
        onMouseMove={(e) => {
          if (isDragging.current) handlePick(e);
        }}
        onMouseUp={() => {
          isDragging.current = false;
        }}
        onMouseLeave={() => {
          isDragging.current = false;
        }}
      />
      <span style={{ fontSize: "11px", color: "var(--re-text-muted)", fontWeight: 500 }}>
        Click or drag on the RGB color wheel
      </span>
    </div>
  );
}

export default function ColorPickerPopup({
  value = "#111827",
  onChange,
  onClose,
  allowNone = true,
  title = "Select Color",
  position = { top: "100%", left: 0 },
}) {
  const isNone = value === "__none__";
  const initialHex = isNone ? "#000000" : (value || "#111827");
  const initialRgb = hexToRgb(initialHex);

  const [hexInput, setHexInput] = useState(initialHex);
  const [rgbState, setRgbState] = useState(initialRgb);
  const [showWheel, setShowWheel] = useState(true);
  const nativeColorRef = useRef(null);

  useEffect(() => {
    if (value && value !== "__none__") {
      setHexInput(value);
      setRgbState(hexToRgb(value));
    }
  }, [value]);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      setRgbState(hexToRgb(val));
      onChange(val);
    }
  };

  const handleRgbInputChange = (channel, val) => {
    const next = { ...rgbState, [channel]: val };
    setRgbState(next);
    const newHex = rgbToHexStr(next.r, next.g, next.b);
    setHexInput(newHex);
    onChange(newHex);
  };

  const handleWheelColorSelect = (newHex) => {
    setHexInput(newHex);
    setRgbState(hexToRgb(newHex));
    onChange(newHex);
  };

  return (
    <div
      className="re-256-color-picker"
      style={position}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="re-256-color-header">
        <span className="re-256-color-title">{title}</span>
        {onClose && (
          <button type="button" className="re-256-color-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {allowNone && (
        <button
          type="button"
          className={["re-256-color-none-btn", isNone ? "is-selected" : ""].filter(Boolean).join(" ")}
          onClick={() => {
            onChange("__none__");
            if (onClose) onClose();
          }}
        >
          <span className="re-color-dot re-color-dot--none" />
          <span>None / Transparent</span>
        </button>
      )}

      {/* Interactive RGB Color Wheel */}
      {showWheel && (
        <ColorWheel onSelectColor={handleWheelColorSelect} currentColor={hexInput} />
      )}

      {/* 256 Color Palette Grid */}
      <div className="re-256-color-grid">
        {PALETTE_256.map((color) => {
          const isSelected = !isNone && value?.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              className={["re-256-color-swatch", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
              style={{ backgroundColor: color }}
              title={color}
              onClick={() => {
                setHexInput(color);
                setRgbState(hexToRgb(color));
                onChange(color);
                if (onClose) onClose();
              }}
            />
          );
        })}
      </div>

      {/* Dynamic 256 RGB / Hex Controls */}
      <div className="re-256-color-custom">
        <div className="re-256-color-preview-row">
          <div
            className="re-256-color-preview-swatch"
            style={{ backgroundColor: isNone ? "transparent" : (hexInput || "#000000") }}
            onClick={() => nativeColorRef.current?.click()}
            title="Click to open native system color picker"
          >
            <input
              ref={nativeColorRef}
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(hexInput) ? hexInput : "#000000"}
              onChange={(e) => {
                const newColor = e.target.value;
                setHexInput(newColor);
                setRgbState(hexToRgb(newColor));
                onChange(newColor);
              }}
              style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
            />
          </div>

          <div className="re-256-color-field">
            <label>Hex</label>
            <input
              type="text"
              className="re-256-color-input"
              value={hexInput}
              onChange={handleHexChange}
              maxLength={7}
            />
          </div>

          <button
            type="button"
            className="re-256-native-btn"
            onClick={() => setShowWheel((prev) => !prev)}
            title="Toggle RGB Color Wheel"
          >
            🎡 {showWheel ? "Hide Wheel" : "Color Wheel"}
          </button>
        </div>

        <div className="re-256-rgb-inputs">
          <div className="re-256-rgb-field">
            <label>R (0-255)</label>
            <input
              type="number"
              min="0"
              max="255"
              value={rgbState.r}
              onChange={(e) => handleRgbInputChange("r", e.target.value)}
            />
          </div>
          <div className="re-256-rgb-field">
            <label>G (0-255)</label>
            <input
              type="number"
              min="0"
              max="255"
              value={rgbState.g}
              onChange={(e) => handleRgbInputChange("g", e.target.value)}
            />
          </div>
          <div className="re-256-rgb-field">
            <label>B (0-255)</label>
            <input
              type="number"
              min="0"
              max="255"
              value={rgbState.b}
              onChange={(e) => handleRgbInputChange("b", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
