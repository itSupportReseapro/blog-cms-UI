export default function Editor({
  rootRef,
  placeholder,
  disabled,
  onInput,
  onBlur,
  onKeyDown,
  onKeyUp,
  onMouseUp,
  onMouseMove,
  onMouseLeave,
  onPaste,
  onDragOver,
  onDrop,
}) {
  return (
    <div
      ref={rootRef}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onInput={onInput}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onPaste={onPaste}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`re-editor${disabled ? " re-editor--disabled" : ""}`}
      data-placeholder={placeholder}
    />
  );
}
