export function parseTabularText(text) {
  if (!text) return [];
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((row, index, rows) => row !== "" || index < rows.length - 1)
    .map((row) => row.split("\t"));
}

export function generateTabularHTML(matrix) {
  if (!Array.isArray(matrix)) return "";
  const rows = matrix.map((row) => {
    const cells = row.map((val) => `<td>${val}</td>`).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table><tbody>${rows}</tbody></table>`;
}
