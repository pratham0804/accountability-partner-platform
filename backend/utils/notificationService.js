const axios = require('axios');
const { getServerUrl } = require('./helperFunctions');

/**
 * Creates a notification through an internal API call
 * @param {Object} data - Notification data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - Created notification
 */
const createNotification = async (data, token) => {
  try {
    const serverUrl = getServerUrl();
    const response = await axios.post(
      `${serverUrl}/api/notifications`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

/**
 * Task notification factory functions
 */
const taskNotifications = {
  // Task reminder notification
  reminder: async (userId, taskId, taskTitle, dueDate, token) => {
    const dueDateStr = new Date(dueDate).toLocaleDateString();
    return createNotification({
      recipient: userId,
      type: 'task_reminder',
      title: 'Task Reminder',
      message: `Your task "${taskTitle}" is due on ${dueDateStr}`,
      link: `/tasks/${taskId}`,
      task: taskId,
      priority: 'medium'
    }, token);
  },
  
  // Task completed notification
  completed: async (userId, taskId, taskTitle, token) => {
    return createNotification({
      recipient: userId,
      type: 'task_completed',
      title: 'Task Completed',
      message: `You've completed the task "${taskTitle}"!`,
      link: `/tasks/${taskId}`,
      task: taskId,
      priority: 'low'
    }, token);
  },
  
  // Proof submitted notification
  proofSubmitted: async (partnerId, taskId, taskTitle, partnershipId, proofId, token) => {
    return createNotification({
      recipient: partnerId,
      type: 'proof_submitted',
      title: 'Proof Submitted for Verification',
      message: `Your partner has submitted proof for the task "${taskTitle}". Please verify it.`,
      link: `/partnerships/${partnershipId}/tasks`,
      task: taskId,
      proof: proofId,
      partnership: partnershipId,
      priority: 'high'
    }, token);
  },
  
  // Proof verified notification
  proofVerified: async (userId, taskId, taskTitle, proofId, token) => {
    return createNotification({
      recipient: userId,
      type: 'proof_verified',
      title: 'Proof Verified',
      message: `Your proof for task "${taskTitle}" has been verified!`,
      link: `/tasks/${taskId}`,
      task: taskId,
      proof: proofId,
      priority: 'medium'
    }, token);
  },
  
  // Proof rejected notification
  proofRejected: async (userId, taskId, taskTitle, proofId, reason, token) => {
    return createNotification({
      recipient: userId,
      type: 'proof_rejected',
      title: 'Proof Rejected',
      message: `Your proof for task "${taskTitle}" was rejected. Reason: ${reason}`,
      link: `/tasks/${taskId}`,
      task: taskId,
      proof: proofId,
      priority: 'high'
    }, token);
  }
};

/**
 * Partnership notification factory functions
 */
const partnershipNotifications = {
  // Partnership request notification
  request: async (recipientId, partnershipId, requesterName, token) => {
    return createNotification({
      recipient: recipientId,
      type: 'partnership_request',
      title: 'New Partnership Request',
      message: `${requesterName} has sent you a partnership request`,
      link: `/partnerships/${partnershipId}`,
      partnership: partnershipId,
      priority: 'high'
    }, token);
  },
  
  // Partnership accepted notification
  accepted: async (requesterId, partnershipId, recipientName, token) => {
    return createNotification({
      recipient: requesterId,
      type: 'partnership_accepted',
      title: 'Partnership Request Accepted',
      message: `${recipientName} has accepted your partnership request`,
      link: `/partnerships/${partnershipId}`,
      partnership: partnershipId,
      priority: 'high'
    }, token);
  },
  
  // Partnership declined notification
  declined: async (requesterId, partnershipId, recipientName, token) => {
    return createNotification({
      recipient: requesterId,
      type: 'partnership_declined',
      title: 'Partnership Request Declined',
      message: `${recipientName} has declined your partnership request`,
      link: '/matches',
      partnership: partnershipId,
      priority: 'medium'
    }, token);
  },
  
  // Agreement created notification
  agreementCreated: async (partnerId, partnershipId, partnerName, token) => {
    return createNotification({
      recipient: partnerId,
      type: 'agreement_created',
      title: 'New Agreement Created',
      message: `${partnerName} has created a new accountability agreement for your partnership`,
      link: `/partnerships/${partnershipId}`,
      partnership: partnershipId,
      priority: 'high'
    }, token);
  },
  
  // Agreement completed notification
  agreementCompleted: async (userId, partnershipId, agreementTitle, token) => {
    return createNotification({
      recipient: userId,
      type: 'agreement_completed',
      title: 'Agreement Completed',
      message: `Your "${agreementTitle}" agreement has been completed`,
      link: `/partnerships/${partnershipId}`,
      partnership: partnershipId,
      priority: 'medium'
    }, token);
  }
};

/**
 * Moderation notification factory functions
 */
const moderationNotifications = {
  // Content filtered warning
  contentWarning: async (userId, messageId, violationType, moderationId, token) => {
    let warningMessage;
    switch(violationType) {
      case 'personal_info':
        warningMessage = 'Your message contained personal information which was filtered. Please avoid sharing personal details.';
        break;
      case 'inappropriate':
        warningMessage = 'Your message contained inappropriate content which was filtered. Please maintain respectful communication.';
        break;
      case 'external_contact':
        warningMessage = 'Your message attempted to establish external contact, which is against platform rules.';
        break;
      default:
        warningMessage = 'Your message violated community guidelines and was filtered.';
    }
    
    return createNotification({
      recipient: userId,
      type: 'moderation_warning',
      title: 'Content Moderation Warning',
      message: warningMessage,
      message: messageId,
      moderation: moderationId,
      priority: 'high'
    }, token);
  },
  
  // Penalty applied notification
  penaltyApplied: async (userId, moderationId, violationType, amount, token) => {
    return createNotification({
      recipient: userId,
      type: 'moderation_warning',
      title: 'Penalty Applied',
      message: `A $${amount} penalty has been applied to your account for ${violationType} violation.`,
      moderation: moderationId,
      priority: 'high'
    }, token);
  }
};

/**
 * Escrow notification factory functions
 */
const escrowNotifications = {
  // Funds deposited to escrow
  deposit: async (userId, partnershipId, amount, transactionId, token) => {
    return createNotification({
      recipient: userId,
      type: 'escrow_deposit',
      title: 'Funds Added to Escrow',
      message: `$${amount} has been successfully added to escrow for your partnership`,
      link: `/partnerships/${partnershipId}`,
      partnership: partnershipId,
      transaction: transactionId,
      priority: 'medium'
    }, token);
  },
  
  // Funds withdrawn from escrow
  withdrawal: async (userId, partnershipId, amount, transactionId, token) => {
    return createNotification({
      recipient: userId,
      type: 'escrow_withdrawal',
      title: 'Escrow Funds Released',
      message: `$${amount} has been released from escrow back to your wallet`,
      link: `/wallet`,
      partnership: partnershipId,
      transaction: transactionId,
      priority: 'medium'
    }, token);
  },
  
  // Reward received
  reward: async (userId, partnershipId, amount, transactionId, token) => {
    return createNotification({
      recipient: userId,
      type: 'escrow_reward',
      title: 'Agreement Completed Successfully',
      message: `Congratulations! You've received $${amount} from escrow for completing your agreement`,
      link: `/wallet`,
      partnership: partnershipId,
      transaction: transactionId,
      priority: 'high'
    }, token);
  },
  
  // Penalty (funds forfeited)
  penalty: async (userId, partnershipId, amount, transactionId, token) => {
    return createNotification({
      recipient: userId,
      type: 'escrow_penalty',
      title: 'Agreement Failed',
      message: `$${amount} has been forfeited from escrow due to not meeting your agreement terms`,
      link: `/partnerships/${partnershipId}`,
      partnership: partnershipId,
      transaction: transactionId,
      priority: 'high'
    }, token);
  }
};

/**
 * Chat notification factory functions
 */
const chatNotifications = {
  // New message notification
  newMessage: async (userId, partnershipId, senderName, messageId, token) => {
    return createNotification({
      recipient: userId,
      type: 'chat_message',
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      link: `/partnerships/${partnershipId}/chat`,
      partnership: partnershipId,
      message: messageId,
      priority: 'medium'
    }, token);
  }
};

module.exports = {
  createNotification,
  taskNotifications,
  partnershipNotifications,
  moderationNotifications,
  escrowNotifications,
  chatNotifications
}; 