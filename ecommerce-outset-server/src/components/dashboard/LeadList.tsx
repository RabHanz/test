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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Lead, LeadStatus } from '../../types/leadScoring';

interface LeadListProps {
  leads?: Lead[];
  onSelectLead?: (leadId: string) => void;
}

const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case LeadStatus.NEW:
      return 'default';
    case LeadStatus.QUALIFIED:
      return 'info';
    case LeadStatus.CONTACTED:
      return 'primary';
    case LeadStatus.NEGOTIATING:
      return 'warning';
    case LeadStatus.CONVERTED:
      return 'success';
    case LeadStatus.LOST:
      return 'error';
    default:
      return 'default';
  }
};

const LeadList: React.FC<LeadListProps> = ({ leads = [], onSelectLead }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Lead</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Score</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              hover
              onClick={() => onSelectLead?.(lead.id)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{lead.name}</Typography>
                  <Tooltip title={lead.email}>
                    <EmailIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2">{lead.company}</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  color={lead.score.totalScore >= 70 ? 'success.main' : 'warning.main'}
                  fontWeight="bold"
                >
                  {lead.score.totalScore}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={lead.status}
                  color={getStatusColor(lead.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Call">
                    <IconButton size="small">
                      <PhoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Email">
                    <IconButton size="small">
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeadList; 