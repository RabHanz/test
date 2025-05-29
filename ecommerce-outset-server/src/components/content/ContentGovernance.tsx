import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  History as HistoryIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

interface ContentVersion {
  id: string;
  version: number;
  content: string;
  author: string;
  timestamp: Date;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  type: 'feedback' | 'approval' | 'rejection';
}

interface ContentGovernanceProps {
  contentId: string;
  initialContent: string;
  onApprove: (content: string) => void;
  onReject: (reason: string) => void;
  onUpdate: (content: string) => void;
}

const ContentGovernance: React.FC<ContentGovernanceProps> = ({
  contentId,
  initialContent,
  onApprove,
  onReject,
  onUpdate,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [versions, setVersions] = useState<ContentVersion[]>([
    {
      id: '1',
      version: 1,
      content: initialContent,
      author: 'Current User',
      timestamp: new Date(),
      status: 'draft',
      comments: [],
    },
  ]);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<'feedback' | 'approval' | 'rejection'>('feedback');

  const steps = ['Draft', 'Review', 'Approval'];

  const handleNext = () => {
    if (activeStep === 0) {
      // Move to review
      const newVersion = {
        ...versions[0],
        status: 'review',
        timestamp: new Date(),
      };
      setVersions([newVersion, ...versions]);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleApprove = () => {
    const newVersion = {
      ...versions[0],
      status: 'approved',
      timestamp: new Date(),
    };
    setVersions([newVersion, ...versions]);
    onApprove(currentContent);
  };

  const handleReject = () => {
    setCommentDialogOpen(true);
    setCommentType('rejection');
  };

  const handleComment = () => {
    setCommentDialogOpen(true);
    setCommentType('feedback');
  };

  const handleCommentSubmit = () => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      text: commentText,
      timestamp: new Date(),
      type: commentType,
    };

    const updatedVersions = versions.map((version) => {
      if (version.id === versions[0].id) {
        return {
          ...version,
          comments: [...version.comments, newComment],
          status: commentType === 'rejection' ? 'rejected' : version.status,
        };
      }
      return version;
    });

    setVersions(updatedVersions);
    setCommentDialogOpen(false);
    setCommentText('');

    if (commentType === 'rejection') {
      onReject(commentText);
    }
  };

  const handleContentUpdate = (newContent: string) => {
    setCurrentContent(newContent);
    onUpdate(newContent);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Editor
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={currentContent}
              onChange={(e) => handleContentUpdate(e.target.value)}
              disabled={activeStep > 0}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Version History
            </Typography>
            {versions.map((version) => (
              <Box key={version.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Version {version.version} - {version.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  By {version.author} on {version.timestamp.toLocaleDateString()}
                </Typography>
                {version.comments.map((comment) => (
                  <Chip
                    key={comment.id}
                    label={comment.text}
                    size="small"
                    sx={{ mt: 1, mr: 1 }}
                    icon={<CommentIcon />}
                  />
                ))}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<HistoryIcon />}
        >
          Back
        </Button>
        <Box>
          {activeStep === 0 && (
            <Button
              variant="contained"
              onClick={handleNext}
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Submit for Review
            </Button>
          )}
          {activeStep === 1 && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                startIcon={<ApproveIcon />}
                sx={{ mr: 1 }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                startIcon={<RejectIcon />}
                sx={{ mr: 1 }}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                onClick={handleComment}
                startIcon={<CommentIcon />}
              >
                Add Comment
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
        <DialogTitle>
          {commentType === 'rejection' ? 'Reject Content' : 'Add Comment'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Comment Type</InputLabel>
            <Select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as any)}
              label="Comment Type"
            >
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="approval">Approval</MenuItem>
              <MenuItem value="rejection">Rejection</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            label="Comment"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCommentSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentGovernance; 