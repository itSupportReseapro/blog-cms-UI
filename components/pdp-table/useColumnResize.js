// components/pdp-table/useColumnResize.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function useColumnResize({
  columns,
  visibleColumns,
  selectable,
  showActions,
  autoFitColumns = true,

  // behavior
  stretchToFill = false, // ✅ IMPORTANT: false = don't expand when few cols visible
  defaultColWidth = 160,
  minColWidth = 120,
  maxColWidth = 260,     // ✅ cap so 1 col won't become huge

  checkboxColWidth = 44,
  serialColWidth = 70,
  actionsColWidth = 90,
  jitterPx = 1,
}) {
  const containerRef = useRef(null);
  const userResizedRef = useRef(false);
  const lastContainerWidthRef = useRef(-1);

  const visibleList = useMemo(() => {
    return (columns || []).filter((c) => Boolean(visibleColumns?.[c.field]));
  }, [columns, visibleColumns]);

  const [columnWidths, setColumnWidths] = useState(() => {
    const init = {};
    (columns || []).forEach((c) => {
      init[c.field] = typeof c.width === "number" ? c.width : defaultColWidth;
    });
    return init;
  });

  // drag-resize
  const initResize = (e, field) => {
    if (!field) return;
    e.preventDefault();
    e.stopPropagation();

    userResizedRef.current = true;

    const startX = e.clientX;
    const startWidth = columnWidths[field] ?? defaultColWidth;

    const onMove = (ev) => {
      const delta = ev.clientX - startX;
      const nextW = Math.max(minColWidth, Math.min(maxColWidth, startWidth + delta));

      setColumnWidths((prev) => {
        if (Math.abs((prev[field] ?? 0) - nextW) <= jitterPx) return prev;
        return { ...prev, [field]: nextW };
      });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ensure new columns get width entry
  useEffect(() => {
    setColumnWidths((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const c of columns || []) {
        if (next[c.field] == null) {
          next[c.field] = typeof c.width === "number" ? c.width : defaultColWidth;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [columns, defaultColWidth]);

  // auto-fit: ONLY reacts to container width changes (not to visibleList changes)
  useEffect(() => {
    if (!autoFitColumns) return;
    if (userResizedRef.current) return;

    const el = containerRef.current;
    if (!el) return;

    let raf = 0;

    const apply = () => {
      const total = el.clientWidth || 0;
      if (total <= 0) return;

      // ignore jitter
      if (Math.abs(total - lastContainerWidthRef.current) <= jitterPx) return;
      lastContainerWidthRef.current = total;

      const fixed =
        (selectable ? checkboxColWidth : 0) +
        serialColWidth +
        (showActions ? actionsColWidth : 0);

      const count = Math.max(1, visibleList.length);

      // if not stretching, keep default width (capped)
      if (!stretchToFill) {
        setColumnWidths((prev) => {
          let changed = false;
          const next = { ...prev };

          for (const c of visibleList) {
            const desired = Math.max(minColWidth, Math.min(maxColWidth, prev[c.field] ?? defaultColWidth));
            if (Math.abs((prev[c.field] ?? 0) - desired) > jitterPx) {
              next[c.field] = desired;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
        return;
      }

      // stretchToFill = true (classic fit)
      const avail = Math.max(0, total - fixed);
      const each = Math.floor(avail / count);

      const fitted = Math.max(minColWidth, Math.min(maxColWidth, each));

      setColumnWidths((prev) => {
        const next = { ...prev };
        let changed = false;

        for (const c of visibleList) {
          if (Math.abs((prev[c.field] ?? 0) - fitted) > jitterPx) {
            next[c.field] = fitted;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    });

    ro.observe(el);

    // run once
    raf = requestAnimationFrame(apply);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // NOTE: intentionally NOT depending on visibleList
  }, [
    autoFitColumns,
    selectable,
    showActions,
    stretchToFill,
    defaultColWidth,
    minColWidth,
    maxColWidth,
    checkboxColWidth,
    serialColWidth,
    actionsColWidth,
    jitterPx,
    visibleList.length, // only count change triggers, not full array thrash
  ]);

  return { containerRef, columnWidths, initResize };
}
