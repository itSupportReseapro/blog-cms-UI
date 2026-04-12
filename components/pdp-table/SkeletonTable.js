"use client";

export default function SkeletonTable({
  columns,
  visibleColumns,
  selectable,
  showActions,
  rows = 8,
}) {
  const visibleCols = columns.filter(c => visibleColumns?.[c.field]);

  return (
    <table className="pdp-table">
      <thead>
        <tr>
          {selectable && <th className="pdp-th" style={{ width: 44 }} />}
          <th className="pdp-th" style={{ width: 74 }}>Sl No.</th>
          {visibleCols.map((c) => (
            <th key={c.field} className="pdp-th">
              <span className="pdp-skelLine" style={{ width: 120 }} />
            </th>
          ))}
          {showActions && <th className="pdp-th" style={{ width: 80 }} />}
        </tr>
      </thead>

      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="pdp-tr">
            {selectable && (
              <td className="pdp-td" style={{ textAlign: "center" }}>
                <span className="pdp-skelDot" />
              </td>
            )}
            <td className="pdp-td">
              <span className="pdp-skelLine" style={{ width: 40 }} />
            </td>

            {visibleCols.map((c) => (
              <td key={c.field} className="pdp-td">
                <span className="pdp-skelLine" style={{ width: `${80 + (i % 3) * 30}px` }} />
              </td>
            ))}

            {showActions && (
              <td className="pdp-td">
                <div className="pdp-actionRow">
                  <span className="pdp-skelBtn" />
                  <span className="pdp-skelBtn" />
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
