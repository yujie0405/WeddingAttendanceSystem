export const formatRM = (amount: number, language = "zh-CN") =>
  `RM ${amount.toLocaleString(language === "en" ? "en-MY" : "zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const timeNow = () => new Date().toTimeString().slice(0, 5);
export const dateTimeNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${timeNow()}`;
};
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
export const palette = ["amber", "blue", "rose", "purple", "teal", "emerald"];
export function tagColor(color: string) {
  if (/slate|gray|neutral/.test(color)) return "legacy-tag-neutral";
  if (color.includes("green") && !color.includes("emerald"))
    return "legacy-tag-green";
  const hue =
    palette.find((h) => color.includes(h)) ||
    (color.includes("green") ? "emerald" : "amber");
  return `wedding-bg-${hue}-100 wedding-text-${hue}-900 wedding-border-${hue}-300`;
}
