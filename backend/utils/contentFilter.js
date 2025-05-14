// Regular expressions for detecting personal information and external contact details
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  phone: /\b(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  socialMedia: /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|twitter\.com|linkedin\.com|snapchat\.com|tiktok\.com)\/[A-Za-z0-9_.-]+/gi,
  
  // Expanded inappropriate words list - in a real app you'd have a much more comprehensive list
  inappropriate: /\b(?:ass|damn|hell|shit|fuck|bitch|bastard|cunt|dick|pussy|slut|whore|cock|bullshit|motherfucker|asshole)\b/gi,
  
  // Contact methods
  contactMethods: /\b(?:call|text|email|message|dm|pm|contact|reach|whatsapp|telegram|signal)\s+me\b/gi,
  
  // URLs and external links
  externalLinks: /\bhttps?:\/\/(?!github\.com\/)[^\s]+\b/gi,

  // Additional personal identifiers
  personalIdentifiers: /\b(?:ssn|social security|passport|driver'?s? license|id number|address|zip code|postal code)\b/gi
};

// Function to check if content contains personal information
const containsPersonalInfo = (content) => {
  return patterns.email.test(content) || 
         patterns.phone.test(content) || 
         patterns.socialMedia.test(content) ||
         patterns.personalIdentifiers.test(content);
};

// Function to check if content contains inappropriate words
const containsInappropriateContent = (content) => {
  return patterns.inappropriate.test(content);
};

// Function to check if content attempts to establish external contact
const containsExternalContactAttempt = (content) => {
  return patterns.contactMethods.test(content) || 
         patterns.externalLinks.test(content);
};

// Calculate penalty amount based on violation type
const calculatePenalty = (violationType) => {
  const penaltyRates = {
    personal_info: 5,       // $5 penalty for sharing personal info
    inappropriate: 3,       // $3 penalty for inappropriate language
    external_contact: 2     // $2 penalty for attempting external contact
  };
  
  return penaltyRates[violationType] || 1; // Default to $1 if type not found
};

// Function to filter content
const filterContent = (content) => {
  let filteredContent = content;
  let filterReason = '';
  let isFiltered = false;
  let penaltyAmount = 0;

  // Check for personal information
  if (containsPersonalInfo(content)) {
    filteredContent = filteredContent
      .replace(patterns.email, '[EMAIL REDACTED]')
      .replace(patterns.phone, '[PHONE REDACTED]')
      .replace(patterns.socialMedia, '[SOCIAL MEDIA LINK REDACTED]')
      .replace(patterns.personalIdentifiers, '[PERSONAL INFORMATION REDACTED]');
    filterReason = 'personal_info';
    isFiltered = true;
    penaltyAmount = calculatePenalty('personal_info');
  }

  // Check for inappropriate content
  if (containsInappropriateContent(content)) {
    filteredContent = filteredContent.replace(patterns.inappropriate, '[INAPPROPRIATE LANGUAGE REDACTED]');
    // Only override the filter reason if not already set (personal_info takes precedence)
    if (!isFiltered) {
      filterReason = 'inappropriate';
    }
    isFiltered = true;
    penaltyAmount += calculatePenalty('inappropriate');
  }

  // Check for external contact attempts
  if (containsExternalContactAttempt(content)) {
    filteredContent = filteredContent
      .replace(patterns.contactMethods, '[CONTACT REQUEST REDACTED]')
      .replace(patterns.externalLinks, '[EXTERNAL LINK REDACTED]');
    // Only override if not already set for more serious violations
    if (!isFiltered) {
      filterReason = 'external_contact';
    }
    isFiltered = true;
    penaltyAmount += calculatePenalty('external_contact');
  }

  return {
    filteredContent,
    filterReason,
    isFiltered,
    penaltyAmount,
    originalContent: content
  };
};

module.exports = {
  filterContent,
  containsPersonalInfo,
  containsInappropriateContent,
  containsExternalContactAttempt,
  calculatePenalty
}; 