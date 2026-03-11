'use client';

const SkeletonTable = ({ columns = [], rows = 8 }) => {
  const skelLine = () => (
    <span
      style={{
        display: 'inline-block',
        height: '12px',
        borderRadius: '999px',
        background: 'linear-gradient(90deg, #f1f3f7 25%, #e8ebf3 37%, #f1f3f7 63%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.2s ease-in-out infinite',
        width: '80%'
      }}
    />
  );

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {columns.map((_, colIdx) => (
            <td key={colIdx}>{skelLine()}</td>
          ))}
          <td>{skelLine()}</td>
        </tr>
      ))}
    </>
  );
};

export default SkeletonTable;
