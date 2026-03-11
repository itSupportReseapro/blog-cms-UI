export default function EditorFooter({ wordCount }) {
  return (
    <div className="re-footer">
      <span className="re-word-count">Words: {wordCount}</span>
    </div>
  );
}
