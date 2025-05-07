const asyncHandler = require('express-async-handler');
const axios = require('axios');
const Integration = require('../models/integrationModel');

// @desc    Connect GitHub account
// @route   POST /api/integrations/github/connect
// @access  Private
const connectGithub = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Authorization code is required');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    // Get user info from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${access_token}`
      }
    });

    const { id, login } = userResponse.data;

    // Check if integration already exists
    let integration = await Integration.findOne({
      user: req.user.id,
      platform: 'github'
    });

    if (integration) {
      // Update existing integration
      integration.accessToken = access_token;
      integration.platformUserId = id.toString();
      integration.platformUsername = login;
      integration.isActive = true;
      integration.lastVerified = new Date();
    } else {
      // Create new integration
      integration = await Integration.create({
        user: req.user.id,
        platform: 'github',
        accessToken: access_token,
        platformUserId: id.toString(),
        platformUsername: login
      });
    }

    await integration.save();

    res.status(200).json({
      success: true,
      message: 'GitHub account connected successfully',
      integration
    });
  } catch (error) {
    console.error('GitHub integration error:', error);
    res.status(500);
    throw new Error('Failed to connect GitHub account');
  }
});

// @desc    Verify GitHub activity
// @route   POST /api/integrations/github/verify
// @access  Private
const verifyGithubActivity = asyncHandler(async (req, res) => {
  const { repository, commitHash, pullRequestNumber } = req.body;

  // Get user's GitHub integration
  const integration = await Integration.findOne({
    user: req.user.id,
    platform: 'github',
    isActive: true
  });

  if (!integration) {
    res.status(404);
    throw new Error('GitHub account not connected');
  }

  try {
    let verificationResult = {};

    if (commitHash) {
      // Verify commit
      const commitResponse = await axios.get(
        `https://api.github.com/repos/${repository}/commits/${commitHash}`,
        {
          headers: {
            Authorization: `token ${integration.accessToken}`
          }
        }
      );

      verificationResult = {
        type: 'commit',
        verified: true,
        data: {
          sha: commitResponse.data.sha,
          message: commitResponse.data.commit.message,
          author: commitResponse.data.commit.author.name,
          date: commitResponse.data.commit.author.date
        }
      };
    } else if (pullRequestNumber) {
      // Verify pull request
      const prResponse = await axios.get(
        `https://api.github.com/repos/${repository}/pulls/${pullRequestNumber}`,
        {
          headers: {
            Authorization: `token ${integration.accessToken}`
          }
        }
      );

      verificationResult = {
        type: 'pull_request',
        verified: true,
        data: {
          number: prResponse.data.number,
          title: prResponse.data.title,
          state: prResponse.data.state,
          created_at: prResponse.data.created_at,
          updated_at: prResponse.data.updated_at
        }
      };
    } else {
      res.status(400);
      throw new Error('Either commit hash or pull request number is required');
    }

    // Update last verified timestamp
    integration.lastVerified = new Date();
    await integration.save();

    res.status(200).json(verificationResult);
  } catch (error) {
    console.error('GitHub verification error:', error);
    res.status(500);
    throw new Error('Failed to verify GitHub activity');
  }
});

// @desc    Get user's connected integrations
// @route   GET /api/integrations
// @access  Private
const getUserIntegrations = asyncHandler(async (req, res) => {
  const integrations = await Integration.find({
    user: req.user.id,
    isActive: true
  }).select('-accessToken -refreshToken');

  res.status(200).json(integrations);
});

// @desc    Disconnect integration
// @route   DELETE /api/integrations/:platform
// @access  Private
const disconnectIntegration = asyncHandler(async (req, res) => {
  const { platform } = req.params;

  const integration = await Integration.findOne({
    user: req.user.id,
    platform
  });

  if (!integration) {
    res.status(404);
    throw new Error('Integration not found');
  }

  integration.isActive = false;
  await integration.save();

  res.status(200).json({
    success: true,
    message: `${platform} integration disconnected successfully`
  });
});

module.exports = {
  connectGithub,
  verifyGithubActivity,
  getUserIntegrations,
  disconnectIntegration
}; 