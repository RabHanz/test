import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Chip,
} from '@mui/material';
import { PersonaType } from '../../types/optimizationHub';
import Link from 'next/link';

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  personaType?: PersonaType;
  readTime: number;
  imageUrl?: string;
}

interface RelatedContentProps {
  posts: RelatedPost[];
  currentPostId: string;
}

export const RelatedContent: React.FC<RelatedContentProps> = ({
  posts,
  currentPostId,
}) => {
  const filteredPosts = posts.filter((post) => post.id !== currentPostId);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Related Articles
      </Typography>
      <List>
        {filteredPosts.map((post) => (
          <Link
            key={post.id}
            href={`/resources/${post.category}/${post.id}`}
            passHref
          >
            <ListItem
              button
              component="a"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {post.imageUrl && (
                  <ListItemAvatar>
                    <Avatar
                      src={post.imageUrl}
                      alt={post.title}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                  </ListItemAvatar>
                )}
                <ListItemText
                  primary={post.title}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {post.excerpt}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Chip
                          label={post.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {post.personaType && (
                          <Chip
                            label={post.personaType}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={`${post.readTime} min read`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />
              </Box>
            </ListItem>
          </Link>
        ))}
      </List>
    </Paper>
  );
}; 