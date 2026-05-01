/**
 * Format price for display in NPR for entire storefront.
 */
export function formatPrice(price) {
  const num = Number(price);
  const safe = Number.isFinite(num) ? num : 0;
  return `Rs ${safe % 1 === 0 ? safe : safe.toFixed(2)}`;
}
