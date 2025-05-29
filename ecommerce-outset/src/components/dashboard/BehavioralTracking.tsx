import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { BehavioralEvent, BehavioralEventType } from '../../types/leadScoring';

interface BehavioralTrackingProps {
  events?: BehavioralEvent[];
}

const getEventTypeColor = (type: BehavioralEventType) => {
  switch (type) {
    case BehavioralEventType.QUIZ_COMPLETION:
      return 'success';
    case BehavioralEventType.VIDEO_ENGAGEMENT:
      return 'primary';
    case BehavioralEventType.TOOL_USAGE:
      return 'secondary';
    case BehavioralEventType.RESOURCE_DOWNLOAD:
      return 'info';
    case BehavioralEventType.PRICING_PAGE_VISIT:
      return 'warning';
    case BehavioralEventType.EMAIL_INTERACTION:
      return 'error';
    case BehavioralEventType.COMMUNITY_PARTICIPATION:
      return 'default';
    default:
      return 'default';
  }
};

const formatEventType = (type: BehavioralEventType) => {
  return type.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

const BehavioralTracking: React.FC<BehavioralTrackingProps> = ({ events = [] }) => {
  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Event Type</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Score Impact</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <Chip
                    label={formatEventType(event.type)}
                    color={getEventTypeColor(event.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(event.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Typography
                    color={event.scoreImpact >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    {event.scoreImpact > 0 ? '+' : ''}{event.scoreImpact}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {Object.entries(event.metadata)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BehavioralTracking; 