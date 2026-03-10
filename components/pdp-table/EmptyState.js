"use client";

export default function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="pdp-emptyWrap">
      <div className="pdp-emptyIcon" aria-hidden="true">📭</div>
      <div className="pdp-emptyTitle">No records found</div>
      <div className="pdp-emptySub">
        {hasFilters
          ? "Try clearing filters or adjusting your search."
          : "No data available yet."}
      </div>

      {hasFilters ? (
        <button type="button" className="pdp-btnPrimary" onClick={onClear}>
          Clear filters & search
        </button>
      ) : null}
    </div>
  );
}
