import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { CRMIntegration, IntegrationStatus as IntegrationStatusType, CRMType } from '../../types/leadScoring';

interface IntegrationStatusProps {
  integrations?: CRMIntegration[];
}

const getStatusColor = (status: IntegrationStatusType) => {
  switch (status) {
    case IntegrationStatusType.ACTIVE:
      return 'success';
    case IntegrationStatusType.ERROR:
      return 'error';
    case IntegrationStatusType.SYNCING:
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: IntegrationStatusType) => {
  switch (status) {
    case IntegrationStatusType.ACTIVE:
      return <CheckCircleIcon color="success" />;
    case IntegrationStatusType.ERROR:
      return <ErrorIcon color="error" />;
    case IntegrationStatusType.SYNCING:
      return <SyncIcon color="warning" />;
    default:
      return <ErrorIcon color="disabled" />;
  }
};

const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ integrations = [] }) => {
  return (
    <List>
      {integrations.map((integration) => (
        <ListItem
          key={integration.id}
          secondaryAction={
            <Box>
              <Tooltip title="Last Sync">
                <Chip
                  size="small"
                  label={new Date(integration.lastSync).toLocaleString()}
                  sx={{ mr: 1 }}
                />
              </Tooltip>
              <Tooltip title="Configure">
                <IconButton edge="end" aria-label="settings">
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <ListItemIcon>
            {getStatusIcon(integration.status)}
          </ListItemIcon>
          <ListItemText
            primary={integration.type}
            secondary={
              <Chip
                size="small"
                label={integration.status}
                color={getStatusColor(integration.status)}
              />
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default IntegrationStatus; 