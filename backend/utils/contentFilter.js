// Regular expressions for detecting personal information and external contact details
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  socialMedia: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|twitter\.com|linkedin\.com)\/[A-Za-z0-9_.-]+/gi,
  inappropriate: /\b(?:bad|inappropriate|words|here)\b/gi // Add more inappropriate words
};

// Function to check if content contains personal information
const containsPersonalInfo = (content) => {
  return patterns.email.test(content) || 
         patterns.phone.test(content) || 
         patterns.socialMedia.test(content);
};

// Function to check if content contains inappropriate words
const containsInappropriateContent = (content) => {
  return patterns.inappropriate.test(content);
};

// Function to filter content
const filterContent = (content) => {
  let filteredContent = content;
  let filterReason = '';
  let isFiltered = false;

  // Check for personal information
  if (containsPersonalInfo(content)) {
    filteredContent = filteredContent
      .replace(patterns.email, '[EMAIL REDACTED]')
      .replace(patterns.phone, '[PHONE REDACTED]')
      .replace(patterns.socialMedia, '[SOCIAL MEDIA LINK REDACTED]');
    filterReason = 'personal_info';
    isFiltered = true;
  }

  // Check for inappropriate content
  if (containsInappropriateContent(content)) {
    filteredContent = filteredContent.replace(patterns.inappropriate, '[REDACTED]');
    filterReason = 'inappropriate';
    isFiltered = true;
  }

  return {
    filteredContent,
    filterReason,
    isFiltered
  };
};

module.exports = {
  filterContent,
  containsPersonalInfo,
  containsInappropriateContent
}; 