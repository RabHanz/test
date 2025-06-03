import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Twitter,
  LinkedIn,
  Facebook,
  Link as LinkIcon,
  Email,
} from '@mui/icons-material';

interface SocialShareProps {
  url: string;
  title: string;
  description: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = React.useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    email: `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const shareUrl = shareLinks[platform];
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Share:
      </Typography>
      <Tooltip title="Share on Twitter">
        <IconButton
          onClick={() => handleShare('twitter')}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <Twitter />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share on LinkedIn">
        <IconButton
          onClick={() => handleShare('linkedin')}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <LinkedIn />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share on Facebook">
        <IconButton
          onClick={() => handleShare('facebook')}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <Facebook />
        </IconButton>
      </Tooltip>
      <Tooltip title="Share via Email">
        <IconButton
          onClick={() => handleShare('email')}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <Email />
        </IconButton>
      </Tooltip>
      <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
        <IconButton
          onClick={handleCopyLink}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <LinkIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}; 