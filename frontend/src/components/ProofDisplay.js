import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Divider, 
  Card,
  CardContent,
  Link,
  Stack,
  Grid,
  Avatar
} from '@mui/material';
import {
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  AccessTime as PendingIcon,
  InsertDriveFile as FileIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  TextFields as TextIcon,
  CalendarToday as DateIcon,
  Info as InfoIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const ProofDisplay = ({ proof }) => {
  if (!proof) {
    return null;
  }

  const renderProofContent = () => {
    switch (proof.proofType) {
      case 'image':
        return (
          <Box sx={{ 
            p: 1, 
            textAlign: 'center', 
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            '& img': {
              maxWidth: '100%',
              borderRadius: 1,
              maxHeight: 300,
              objectFit: 'contain'
            }
          }}>
            <img src={proof.content} alt="Proof" />
          </Box>
        );
      case 'link':
        return (
          <Box sx={{ p: 1 }}>
            <Link 
              href={proof.content} 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 500,
                wordBreak: 'break-all'
              }}
            >
              <LinkIcon sx={{ mr: 1 }} />
              {proof.content}
            </Link>
          </Box>
        );
      case 'file':
        return (
          <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
            <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography>
              <Box component="span" sx={{ fontWeight: 600 }}>File Reference:</Box> {proof.content}
            </Typography>
          </Box>
        );
      case 'text':
      default:
        return (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              fontSize: '0.95rem',
              lineHeight: 1.6
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {proof.content}
            </Typography>
          </Box>
        );
    }
  };

  const getStatusInfo = () => {
    switch (proof.verificationStatus) {
      case 'approved':
        return {
          icon: <ApprovedIcon />,
          color: 'success',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: <RejectedIcon />,
          color: 'error',
          label: 'Rejected'
        };
      case 'pending':
      default:
        return {
          icon: <PendingIcon />,
          color: 'warning',
          label: 'Pending'
        };
    }
  };

  const statusInfo = getStatusInfo();
  
  const getProofTypeIcon = () => {
    switch (proof.proofType) {
      case 'image':
        return <ImageIcon />;
      case 'link':
        return <LinkIcon />;
      case 'file':
        return <FileIcon />;
      case 'text':
      default:
        return <TextIcon />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          overflow: 'hidden',
          borderTop: '4px solid',
          borderColor: `${statusInfo.color}.main`
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 2
        }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mr: 2 }}>
                Proof of Completion
              </Typography>
              <Chip 
                icon={statusInfo.icon} 
                label={statusInfo.label} 
                color={statusInfo.color} 
                size="small"
                variant={proof.verificationStatus === 'pending' ? 'outlined' : 'filled'}
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              {getProofTypeIcon()} 
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
                Type: {proof.proofType.charAt(0).toUpperCase() + proof.proofType.slice(1)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DateIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Submitted: {format(new Date(proof.createdAt), 'PPP')}
              </Typography>
            </Box>
          </Grid>
          {proof.verifiedAt && (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DateIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {proof.verificationStatus === 'approved' ? 'Verified' : 'Reviewed'}: {format(new Date(proof.verifiedAt), 'PPP')}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h4" sx={{ mb: 2, fontWeight: 500 }}>
            Submission
          </Typography>
          {renderProofContent()}
        </Box>

        {proof.additionalNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InfoIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Additional Notes
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {proof.additionalNotes}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {proof.verificationStatus !== 'pending' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: proof.verificationStatus === 'approved' ? 'success.lighter' : 'error.lighter',
                borderColor: proof.verificationStatus === 'approved' ? 'success.light' : 'error.light'
              }}
            >
              <Typography variant="h6" component="h4" sx={{ 
                mb: 2, 
                fontWeight: 500,
                color: proof.verificationStatus === 'approved' ? 'success.darker' : 'error.darker' 
              }}>
                Verification Details
              </Typography>
              
              {proof.verificationStatus === 'approved' && proof.verificationComment && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Verifier Comment:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {proof.verificationComment}
                  </Typography>
                </Box>
              )}
              
              {proof.verificationStatus === 'rejected' && proof.rejectionReason && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Reason for Rejection:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {proof.rejectionReason}
                  </Typography>
                </Box>
              )}
              
              {proof.verifier && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    alt={proof.verifier.name || 'Unknown'}
                    src={proof.verifier.avatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  >
                    {proof.verifier.name ? proof.verifier.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      Verified by:
                    </Box> {proof.verifier.name || 'Unknown'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </Paper>
    </motion.div>
  );
};

export default ProofDisplay; 