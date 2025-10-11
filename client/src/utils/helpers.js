/**
 * Format currency in VND format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
};
