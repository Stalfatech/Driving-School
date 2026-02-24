

/**
 * Dynamic Canadian Tax Calculator
 * @param {number} price - Base package price
 * @param {object} region - The region object from your Settings state
 * @returns {object} - Itemized breakdown
 */
export const calculateCanadianInvoice = (price, region) => {
  if (!region) return { total: price, formattedTotal: `$${price.toFixed(2)}` };

  const taxAmount = price * region.rate;
  const total = price + taxAmount;

  return {
    subtotal: price,
    taxName: region.taxName || "Tax",
    taxRate: region.rate,
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    formattedTotal: new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(total)
  };
};