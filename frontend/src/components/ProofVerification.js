import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Divider, 
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Alert
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Undo as UndoIcon,
  Send as SendIcon
} from '@mui/icons-material';
import ProofDisplay from './ProofDisplay';

const ProofVerification = ({ proof, onVerificationComplete }) => {
  const [verificationComment, setVerificationComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!proof) {
    return null;
  }

  const handleApprove = async () => {
    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/proofs/${proof._id}/verify`,
        { verificationComment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setLoading(false);
      toast.success('Proof approved successfully');
      
      if (onVerificationComplete) {
        onVerificationComplete(response.data);
      }
    } catch (error) {
      console.error('Error approving proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to approve proof');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/proofs/${proof._id}/reject`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setLoading(false);
      toast.info('Proof rejected');
      
      if (onVerificationComplete) {
        onVerificationComplete(response.data);
      }
    } catch (error) {
      console.error('Error rejecting proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to reject proof');
    }
  };

  // Don't show verification controls if proof is already verified or rejected
  if (proof.verificationStatus !== 'pending') {
    return <ProofDisplay proof={proof} />;
  }

  return (
    <Box>
      <ProofDisplay proof={proof} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper
          elevation={2}
          sx={{ 
            mt: 3, 
            p: 3, 
            borderRadius: 2,
            background: 'linear-gradient(to right, #f7f9fc, #edf2f7)'
          }}
        >
          <Typography variant="h5" component="h3" sx={{ 
            mb: 2, 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center' 
          }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.5,
                fontSize: '0.875rem',
                fontWeight: 'bold'
              }}
            >
              ?
            </Box>
            Verify Proof
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <AnimatePresence mode="wait">
            {!showRejectionForm ? (
              <motion.div
                key="approval-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Alert 
                  severity="info" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  variant="outlined"
                >
                  Please review the proof carefully before approving or rejecting.
                </Alert>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    id="verificationComment"
                    label="Verification Comment (Optional)"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={verificationComment}
                    onChange={(e) => setVerificationComment(e.target.value)}
                    placeholder="Add a comment for the proof submitter..."
                  />
                </Box>
                
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ justifyContent: 'flex-end' }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setShowRejectionForm(true)}
                    disabled={loading}
                    startIcon={<RejectIcon />}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                      px: 3,
                      fontWeight: 500
                    }}
                  >
                    Reject Proof
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleApprove}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ApproveIcon />}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                      px: 3,
                      fontWeight: 500
                    }}
                  >
                    {loading ? 'Processing...' : 'Approve Proof'}
                  </Button>
                </Stack>
              </motion.div>
            ) : (
              <motion.div
                key="rejection-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    borderColor: 'error.main',
                    bgcolor: 'error.lighter'
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 1, 
                        fontWeight: 600,
                        color: 'error.dark',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <RejectIcon sx={{ mr: 1 }} fontSize="small" />
                      Rejecting Proof
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please provide a clear explanation for why this proof is being rejected. 
                      This feedback will be shared with the submitter.
                    </Typography>
                  </CardContent>
                </Card>
                
                <Box component="form" onSubmit={handleReject} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    id="rejectionReason"
                    label="Reason for Rejection"
                    variant="outlined"
                    color="error"
                    required
                    multiline
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this proof is being rejected..."
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: 'error.main',
                        },
                      },
                    }}
                  />
                  
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                    sx={{ justifyContent: 'flex-end' }}
                  >
                    <Button
                      type="button"
                      variant="outlined"
                      color="inherit"
                      onClick={() => setShowRejectionForm(false)}
                      disabled={loading}
                      startIcon={<UndoIcon />}
                      sx={{ 
                        borderRadius: 2,
                        py: 1,
                        px: 3
                      }}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="error"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{ 
                        borderRadius: 2,
                        py: 1,
                        px: 3,
                        fontWeight: 500
                      }}
                    >
                      {loading ? 'Processing...' : 'Submit Rejection'}
                    </Button>
                  </Stack>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ProofVerification; 