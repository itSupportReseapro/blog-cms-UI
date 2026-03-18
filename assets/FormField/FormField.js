"use client";

export default function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  textarea = false,
  large = false
}) {
  return (
    <div className={`input-group ${textarea ? "textarea" : ""} ${large ? "large" : ""}`}>
      {textarea ? (
        <textarea
          name={name}
          placeholder=" "
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder=" "
          value={value}
          onChange={onChange}
        />
      )}

      <label>{label}</label>
    </div>
  );
}