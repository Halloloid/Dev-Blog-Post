interface PaginationProps {
  currentPage?: number;
  totalPage?: number;
  onHandleNext?: (page: number) => void;
  onHandlePrevious?: (page: number) => void;
}

export function Pagination({ currentPage = 1, totalPage = 12, onHandleNext, onHandlePrevious }: PaginationProps) {
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPage;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="relative inline-flex items-center">

      {/* Ambient glow — subtle, not overwhelming */}
      <div
        className="relative flex items-center"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "16px",
          padding: "6px",
          gap: "2px",
          backdropFilter: "blur(20px)",
        }}
      >

        {/* Previous button */}
        <button
          disabled={isFirst}
          onClick={() => onHandlePrevious?.(currentPage - 1)}
          style={{
            background: isFirst ? "transparent" : "rgba(255,255,255,0.06)",
            border: "1px solid",
            borderColor: isFirst ? "transparent" : "rgba(255,255,255,0.10)",
            borderRadius: "10px",
            color: isFirst ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.80)",
            cursor: isFirst ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "500",
            letterSpacing: "0.01em",
            padding: "8px 16px",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { if (!isFirst) { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}}
          onMouseLeave={e => { if (!isFirst) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Prev
        </button>

        {/* Page count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 14px",
            minWidth: "80px",
            justifyContent: "center",
          }}
        >
          <span style={{
            fontSize: "15px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #e879f9, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
          }}>
            {currentPage}
          </span>
          <span style={{ color: "rgba(255,255,255,0.20)", fontSize: "13px", fontWeight: "300" }}>/</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", fontWeight: "500" }}>
            {totalPage}
          </span>
        </div>

        {/* Next button */}
        <button
          disabled={isLast}
          onClick={() => onHandleNext?.(currentPage + 1)}
          style={{
            background: isLast
              ? "transparent"
              : "linear-gradient(135deg, rgba(168,85,247,0.80) 0%, rgba(217,70,239,0.80) 100%)",
            border: "1px solid",
            borderColor: isLast ? "transparent" : "rgba(255,255,255,0.15)",
            borderRadius: "10px",
            color: isLast ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.95)",
            cursor: isLast ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "0.01em",
            padding: "8px 16px",
            transition: "all 0.15s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { if (!isLast) { e.currentTarget.style.transform = "translateY(-1px)"; }}}
          onMouseLeave={e => { if (!isLast) { e.currentTarget.style.transform = "translateY(0)"; }}}
        >
          Next
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

      </div>
    </div>
  );
}
