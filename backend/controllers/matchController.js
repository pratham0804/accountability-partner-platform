const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

// @desc    Get potential accountability partners
// @route   GET /api/matches
// @access  Private
const getPotentialMatches = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's preferences
  const { interests, skills, activityLevel, preferredPartnerType } = user;
  
  // Build query to find potential matches
  const query = {
    _id: { $ne: user._id }, // Exclude current user
  };
  
  // Find users with at least one matching interest or skill
  if (interests.length > 0 || skills.length > 0) {
    query.$or = [];
    
    if (interests.length > 0) {
      query.$or.push({ interests: { $in: interests } });
    }
    
    if (skills.length > 0) {
      query.$or.push({ skills: { $in: skills } });
    }
  }
  
  // Apply preferred partner type filter if not 'any'
  if (preferredPartnerType !== 'any') {
    switch (preferredPartnerType) {
      case 'same-level':
        query.activityLevel = activityLevel;
        break;
      case 'more-experienced':
        query.activityLevel = activityLevel === 'low' 
          ? { $in: ['medium', 'high'] } 
          : activityLevel === 'medium' 
            ? 'high' 
            : 'high'; // Still high for high, just less options
        break;
      case 'less-experienced':
        query.activityLevel = activityLevel === 'high' 
          ? { $in: ['medium', 'low'] } 
          : activityLevel === 'medium' 
            ? 'low' 
            : 'low'; // Still low for low, just less options
        break;
    }
  }

  // Find potential matches
  const potentialMatches = await User.find(query)
    .select('_id interests skills activityLevel') // Include ID but keep other identity details private
    .limit(20);
  
  // Calculate compatibility score for each match
  const scoredMatches = potentialMatches.map(match => {
    // Count matching interests
    const matchingInterests = match.interests.filter(interest => 
      interests.includes(interest)
    );
    
    // Count matching skills
    const matchingSkills = match.skills.filter(skill => 
      skills.includes(skill)
    );
    
    // Calculate base score from matching interests and skills
    let score = 
      (matchingInterests.length * 10) + // 10 points per matching interest
      (matchingSkills.length * 5);      // 5 points per matching skill
    
    // Add activity level compatibility bonus
    if (match.activityLevel === activityLevel) {
      score += 20; // 20 points for same activity level
    } else if (
      (activityLevel === 'medium' && 
       (match.activityLevel === 'low' || match.activityLevel === 'high')) ||
      (match.activityLevel === 'medium' && 
       (activityLevel === 'low' || activityLevel === 'high'))
    ) {
      score += 10; // 10 points for being one level apart
    }
    
    // Return match with score and matching items
    return {
      _id: match._id, // Include the user ID for partnership requests
      score,
      matchingInterests,
      totalMatchingInterests: matchingInterests.length,
      matchingSkills,
      totalMatchingSkills: matchingSkills.length,
      interests: match.interests, // All interests
      skills: match.skills, // All skills
      activityLevel: match.activityLevel,
      compatibilityPercentage: Math.min(100, Math.round(score / 2))
    };
  });
  
  // Sort by score (highest first)
  scoredMatches.sort((a, b) => b.score - a.score);
  
  // Return top 5 matches
  res.json(scoredMatches.slice(0, 5));
});

module.exports = {
  getPotentialMatches,
}; 