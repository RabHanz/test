import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  MoreVert as MoreVertIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  Code as CodeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

interface HelpSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'code' | 'tutorial';
  link?: string;
}

interface AnalyticsHelpProps {
  sections: HelpSection[];
  loading?: boolean;
}

export const AnalyticsHelp: React.FC<AnalyticsHelpProps> = ({
  sections,
  loading = false,
}) => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getSectionIcon = (type: HelpSection['type']) => {
    switch (type) {
      case 'text':
        return <BookIcon />;
      case 'video':
        return <VideoIcon />;
      case 'code':
        return <CodeIcon />;
      case 'tutorial':
        return <SchoolIcon />;
    }
  };

  return (
    <Card>
      <CardHeader
        title="Analytics Help & Documentation"
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
      />
      <CardContent>
        {loading ? (
          <Typography color="text.secondary">Loading help content...</Typography>
        ) : sections.length === 0 ? (
          <Typography color="text.secondary">No help content available</Typography>
        ) : (
          <Stack spacing={2}>
            {sections.map((section) => (
              <Accordion
                key={section.id}
                expanded={expanded === section.id}
                onChange={handleChange(section.id)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${section.id}-content`}
                  id={`${section.id}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getSectionIcon(section.type)}
                    <Typography>{section.title}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    {section.content}
                  </Typography>
                  {section.link && (
                    <Link
                      href={section.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      Learn more
                    </Link>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <HelpIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Getting Started Guide"
                    secondary="Learn the basics of using the analytics dashboard"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BookIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="API Documentation"
                    secondary="Reference for integrating with our analytics API"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <VideoIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Video Tutorials"
                    secondary="Watch step-by-step guides for advanced features"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Best Practices"
                    secondary="Learn how to get the most out of your analytics"
                  />
                </ListItem>
              </List>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Need More Help?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If you need additional assistance, please contact our support team
                at{' '}
                <Link href="mailto:support@example.com">
                  support@example.com
                </Link>
                . We're here to help you make the most of your analytics data.
              </Typography>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}; 