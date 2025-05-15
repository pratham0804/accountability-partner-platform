import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton,
  CircularProgress,
  Divider,
  FormHelperText,
  Alert,
  Chip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Link as LinkIcon,
  Description as TextIcon,
  Image as ImageIcon,
  GitHub as GitHubIcon,
  AttachFile as FileIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

const ProofSubmission = ({ taskId, onProofSubmitted }) => {
  const [proofType, setProofType] = useState('text');
  const [content, setContent] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubCommitHash, setGithubCommitHash] = useState('');
  const [githubPullRequest, setGithubPullRequest] = useState('');
  const [fileUploadName, setFileUploadName] = useState('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/integrations',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (!userInfo || !userInfo.token) {
        toast.error('You need to be logged in');
        setLoading(false);
        return;
      }

      let proofContent = content;

      // Handle GitHub verification
      if (proofType === 'github') {
        if (!githubRepo) {
          toast.error('Please enter a repository name');
          setLoading(false);
          return;
        }

        if (!githubCommitHash && !githubPullRequest) {
          toast.error('Please enter either a commit hash or pull request number');
          setLoading(false);
          return;
        }

        try {
          const verificationResponse = await axios.post(
            'http://localhost:5000/api/integrations/github/verify',
            {
              repository: githubRepo,
              commitHash: githubCommitHash,
              pullRequestNumber: githubPullRequest
            },
            { headers: { Authorization: `Bearer ${userInfo.token}` } }
          );

          proofContent = JSON.stringify(verificationResponse.data);
        } catch (error) {
          console.error('Error verifying GitHub activity:', error);
          toast.error('Failed to verify GitHub activity');
          setLoading(false);
          return;
        }
      }

      const response = await axios.post(
        'http://localhost:5000/api/proofs',
        {
          taskId,
          proofType,
          content: proofContent,
          additionalNotes
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );

      setLoading(false);
      toast.success('Proof submitted successfully');
      
      if (onProofSubmitted) {
        onProofSubmitted(response.data);
      }

      // Reset form
      setProofType('text');
      setContent('');
      setAdditionalNotes('');
      setGithubRepo('');
      setGithubCommitHash('');
      setGithubPullRequest('');
      setFileUploadName('');
    } catch (error) {
      console.error('Error submitting proof:', error);
      setLoading(false);
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContent(file);
      setFileUploadName(file.name);
    }
  };

  const hasGithubIntegration = integrations.some(
    i => i.platform === 'github' && i.isActive
  );

  const getProofTypeIcon = (type) => {
    switch(type) {
      case 'text': return <TextIcon />;
      case 'image': return <ImageIcon />;
      case 'link': return <LinkIcon />;
      case 'file': return <FileIcon />;
      case 'github': return <GitHubIcon />;
      default: return <TextIcon />;
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
          background: 'linear-gradient(to right, #f7f9fc, #edf2f7)'
        }}
      >
        <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
          Submit Proof
        </Typography>

        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="proof-type-label">Proof Type</InputLabel>
            <Select
              labelId="proof-type-label"
              id="proofType"
              value={proofType}
              label="Proof Type"
              onChange={(e) => setProofType(e.target.value)}
              startAdornment={
                <Box sx={{ mr: 1, color: 'primary.main' }}>
                  {getProofTypeIcon(proofType)}
                </Box>
              }
            >
              <MenuItem value="text">Text Description</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="link">Link</MenuItem>
              <MenuItem value="file">File</MenuItem>
              {hasGithubIntegration && (
                <MenuItem value="github">GitHub Activity</MenuItem>
              )}
            </Select>
            <FormHelperText>Select how you want to verify task completion</FormHelperText>
          </FormControl>

          {proofType === 'github' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 2, 
                borderRadius: 2,
                border: '1px solid rgba(25, 118, 210, 0.2)',
                mb: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GitHubIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    GitHub Verification
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  label="Repository (owner/repo)"
                  variant="outlined"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="e.g., username/repository"
                  required
                  size="small"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Commit Hash"
                  variant="outlined"
                  value={githubCommitHash}
                  onChange={(e) => setGithubCommitHash(e.target.value)}
                  placeholder="e.g., a1b2c3d4"
                  size="small"
                  sx={{ mb: 2 }}
                  helperText="Enter a commit hash or pull request number (at least one required)"
                />

                <TextField
                  fullWidth
                  label="Pull Request Number"
                  variant="outlined"
                  type="number"
                  value={githubPullRequest}
                  onChange={(e) => setGithubPullRequest(e.target.value)}
                  placeholder="e.g., 123"
                  size="small"
                />
              </Box>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              key={proofType} // Force re-render animation on type change
            >
              <Box sx={{ mb: 3 }}>
                {proofType === 'text' && (
                  <TextField
                    fullWidth
                    id="content"
                    label="Proof Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe how you completed this task..."
                    required
                  />
                )}
                
                {proofType === 'link' && (
                  <TextField
                    fullWidth
                    id="content"
                    label="Link URL"
                    variant="outlined"
                    type="url"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter URL to proof..."
                    required
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                )}
                
                {(proofType === 'image' || proofType === 'file') && (
                  <Box sx={{
                    border: '1px dashed rgba(0, 0, 0, 0.2)',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'background.paper'
                  }}>
                    <input
                      type="file"
                      id="file-upload"
                      accept={proofType === 'image' ? "image/*" : undefined}
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        {proofType === 'image' ? 'Upload Image' : 'Upload File'}
                      </Button>
                    </label>
                    
                    {fileUploadName && (
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label={fileUploadName} 
                          variant="outlined" 
                          icon={proofType === 'image' ? <ImageIcon /> : <FileIcon />} 
                          color="primary"
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </motion.div>
          )}

          <TextField
            fullWidth
            id="additionalNotes"
            label="Additional Notes (Optional)"
            variant="outlined"
            multiline
            rows={2}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Add any additional context..."
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{ 
              borderRadius: 2,
              minWidth: 150
            }}
          >
            {loading ? 'Submitting...' : 'Submit Proof'}
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default ProofSubmission; 