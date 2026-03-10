export default function Editor({
  rootRef,
  placeholder,
  disabled,
  onInput,
  onBlur,
  onKeyDown,
  onKeyUp,
  onMouseUp,
  onPaste,
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
      onPaste={onPaste}
      className={`re-editor${disabled ? " re-editor--disabled" : ""}`}
      data-placeholder={placeholder}
    />
  );
}
