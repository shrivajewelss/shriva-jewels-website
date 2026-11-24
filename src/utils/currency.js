export const formatPrice = (n) => {
  if (n === "" || n === null || n === undefined) return "";
  const num = Number(n);
  if (isNaN(num)) return "";
  return `₹${num.toLocaleString("en-IN")}`;
};
