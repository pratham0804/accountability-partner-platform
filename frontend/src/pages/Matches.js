import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Chip, 
  Button, 
  CircularProgress, 
  Divider,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Interests as InterestsIcon,
  Code as CodeIcon,
  Timeline as ActivityIcon,
  InfoOutlined as InfoIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchMatches = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get('/api/matches', config);
        setMatches(data);
        setIsLoading(false);
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Failed to load potential matches'
        );
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  const handleSendRequest = async (matchIndex) => {
    try {
      setError('');
      setSuccessMessage('');
      
      const match = matches[matchIndex];
      if (!match || !match._id) {
        setError('Unable to identify selected match');
        return;
      }
      
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.post('/api/partnerships', { recipientId: match._id }, config);
      
      setSuccessMessage('Partnership request sent successfully');
      
      // Disable the button for this match
      const updatedMatches = [...matches];
      updatedMatches[matchIndex] = {
        ...updatedMatches[matchIndex],
        requestSent: true
      };
      setMatches(updatedMatches);
      
      // Redirect to partnerships page after a short delay
      setTimeout(() => {
        navigate('/partnerships');
      }, 2000);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Failed to send partnership request'
      );
    }
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        flexDirection="column"
        minHeight="70vh"
        gap={3}
      >
        <CircularProgress size={40} color="primary" />
        <Typography variant="body1" color="text.secondary">
          Finding your potential accountability partners...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2, 
              background: 'linear-gradient(to right, #f5f7fa, #e4e7eb)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                Find Your Accountability Partner
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Connect with partners who share similar interests and goals
              </Typography>
            </Box>
            
            <Tooltip title="More interests in your profile will help find better matches">
              <IconButton color="primary" sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Paper>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {successMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {matches.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 2, 
                textAlign: 'center',
                bgcolor: 'background.paper',
                border: '1px dashed rgba(0, 0, 0, 0.12)'
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src="https://cdn-icons-png.flaticon.com/512/3349/3349234.png"
                  alt="No matches"
                  sx={{ width: 120, height: 120, opacity: 0.7, mb: 2 }}
                />
              </Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                No potential matches found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                Try updating your profile with more interests and skills to find partners who share your goals.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/profile')}
                sx={{ borderRadius: 2 }}
              >
                Update Profile
              </Button>
            </Paper>
          </motion.div>
        ) : (
          <Grid container spacing={3}>
            {matches.map((match, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 2, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, #f6f9fc, #edf2f7)',
                        position: 'relative'
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box
                          sx={{
                            position: 'relative',
                            width: 110,
                            height: 110,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* Background circle */}
                          <Box
                            sx={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0,0,0,0.05)',
                            }}
                          />
                          
                          {/* Progress path - changes color based on percentage */}
                          <CircularProgress
                            variant="determinate"
                            value={100}
                            size={110}
                            thickness={4}
                            sx={{
                              position: 'absolute',
                              color: 'rgba(0,0,0,0.1)',
                            }}
                          />
                          
                          {/* Actual progress */}
                          <CircularProgress
                            variant="determinate"
                            value={match.compatibilityPercentage}
                            size={110}
                            thickness={4}
                            sx={{
                              position: 'absolute',
                              color: '#6366f1',
                              transition: 'all 0.8s ease-in-out',
                            }}
                          />
                          
                          {/* SVG gradient definition */}
                          <Box 
                            component="svg" 
                            sx={{ 
                              width: 0, 
                              height: 0, 
                              position: 'absolute'
                            }}
                          >
                            <defs>
                              <linearGradient id="purpleBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8a2be2" />
                                <stop offset="50%" stopColor="#4361ee" />
                                <stop offset="100%" stopColor="#4cc9f0" />
                              </linearGradient>
                            </defs>
                          </Box>
                          
                          {/* Inner white circle with percentage text */}
                          <Box
                            sx={{
                              width: 85,
                              height: 85,
                              borderRadius: '50%',
                              background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                              zIndex: 1,
                              border: '2px solid',
                              borderColor: 'rgba(99, 102, 241, 0.2)',
                            }}
                          >
                            <Typography 
                              variant="h4" 
                              component="div" 
                              sx={{ 
                                fontWeight: 700,
                                lineHeight: 1,
                                color: '#6366f1',
                              }}
                            >
                              {match.compatibilityPercentage}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              component="div" 
                              sx={{ 
                                fontWeight: 600,
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                marginTop: '-2px'
                              }}
                            >
                              %
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                      
                      <Typography 
                        variant="subtitle1"
                        sx={{ 
                          position: 'absolute',
                          bottom: 10,
                          color: 'text.secondary',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Compatibility
                      </Typography>
                    </Box>
                    
                    <CardContent sx={{ 
                      p: 2, 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column'
                    }}>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ActivityIcon color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Activity Level: {match.activityLevel.charAt(0).toUpperCase() + match.activityLevel.slice(1)}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      {match.matchingInterests.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <InterestsIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Matching Interests ({match.totalMatchingInterests})
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {match.matchingInterests.slice(0, 5).map((interest, i) => (
                              <Chip 
                                key={i}
                                label={interest}
                                size="small"
                                color="primary"
                                variant="outlined" 
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            ))}
                            {match.matchingInterests.length > 5 && (
                              <Chip 
                                label={`+${match.matchingInterests.length - 5}`}
                                size="small"
                                variant="filled"
                                color="primary"
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {match.matchingSkills.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CodeIcon color="secondary" sx={{ mr: 1, fontSize: 20 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Matching Skills ({match.totalMatchingSkills})
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {match.matchingSkills.slice(0, 5).map((skill, i) => (
                              <Chip 
                                key={i}
                                label={skill}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            ))}
                            {match.matchingSkills.length > 5 && (
                              <Chip 
                                label={`+${match.matchingSkills.length - 5}`}
                                size="small"
                                variant="filled"
                                color="secondary"
                                sx={{ 
                                  fontWeight: 500,
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default Matches;