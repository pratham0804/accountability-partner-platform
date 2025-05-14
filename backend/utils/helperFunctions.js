/**
 * Get the server base URL for internal API calls
 * @returns {string} The server base URL
 */
const getServerUrl = () => {
  // In production, this would use environment variables
  return process.env.SERVER_URL || 'http://localhost:5000';
};

/**
 * Format a date to a user-friendly string
 * @param {Date|string} date The date to format
 * @param {boolean} includeTime Whether to include the time
 * @returns {string} The formatted date string
 */
const formatDate = (date, includeTime = false) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Calculate days remaining until a deadline
 * @param {Date|string} deadline The deadline date
 * @returns {number} Days remaining (negative if past due)
 */
const daysRemaining = (deadline) => {
  if (!deadline) return 0;
  
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Format currency amount
 * @param {number} amount The amount to format
 * @param {string} currency The currency code
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Truncate text to a specified length
 * @param {string} text The text to truncate
 * @param {number} maxLength Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

module.exports = {
  getServerUrl,
  formatDate,
  daysRemaining,
  formatCurrency,
  truncateText
}; 