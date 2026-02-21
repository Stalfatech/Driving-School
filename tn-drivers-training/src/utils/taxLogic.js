/**
 * Canadian Tax Rates (as of 2024/2025)
 * Rates are expressed as decimals (e.g., 0.15 for 15%)
 */
export const PROVINCIAL_TAX_CONFIG = {
  "NL": { name: "HST", rate: 0.15 }, // Newfoundland and Labrador
  "NS": { name: "HST", rate: 0.15 }, // Nova Scotia
  "NB": { name: "HST", rate: 0.15 }, // New Brunswick
  "PE": { name: "HST", rate: 0.15 }, // Prince Edward Island
  "ON": { name: "HST", rate: 0.13 }, // Ontario
  "AB": { name: "GST", rate: 0.05 }, // Alberta
  "BC": { name: "GST+PST", rate: 0.12 }, // British Columbia (Combined)
  "QC": { name: "GST+QST", rate: 0.14975 }, // Quebec
};

/**
 * Calculates the tax and total for a package
 * @param {number} price - The base price of the package
 * @param {string} province - The 2-letter province code
 * @returns {object} - Itemized breakdown
 */
export const calculateCanadianInvoice = (price, province = "NL") => {
  const config = PROVINCIAL_TAX_CONFIG[province] || PROVINCIAL_TAX_CONFIG["NL"];
  const taxAmount = price * config.rate;
  const total = price + taxAmount;

  return {
    subtotal: price,
    taxName: config.name,
    taxRate: config.rate,
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    formattedTotal: new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(total)
  };
};