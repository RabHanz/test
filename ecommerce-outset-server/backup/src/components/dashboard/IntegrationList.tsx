import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
} from '@mui/material';
import {
  IntegrationProject,
  IntegrationStatus,
  IntegrationType,
} from '../../types/integration';

interface IntegrationListProps {
  integrations: IntegrationProject[];
  selectedIntegration: IntegrationProject | null;
  onIntegrationSelect: (integration: IntegrationProject) => void;
}

const IntegrationList: React.FC<IntegrationListProps> = ({
  integrations,
  selectedIntegration,
  onIntegrationSelect,
}) => {
  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case IntegrationStatus.ACTIVE:
        return 'success';
      case IntegrationStatus.INACTIVE:
        return 'default';
      case IntegrationStatus.PENDING:
        return 'info';
      case IntegrationStatus.FAILED:
        return 'error';
      case IntegrationStatus.MAINTENANCE:
        return 'warning';
      case IntegrationStatus.DEPRECATED:
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: IntegrationType) => {
    switch (type) {
      case IntegrationType.API:
        return 'primary';
      case IntegrationType.WEBHOOK:
        return 'secondary';
      case IntegrationType.DATABASE:
        return 'success';
      case IntegrationType.FILE_TRANSFER:
        return 'info';
      case IntegrationType.MESSAGE_QUEUE:
        return 'warning';
      case IntegrationType.CUSTOM:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
      <List>
        {integrations.map(integration => (
          <ListItem
            key={integration.id}
            button
            selected={selectedIntegration?.id === integration.id}
            onClick={() => onIntegrationSelect(integration)}
          >
            <ListItemText
              primary={integration.name}
              secondary={
                <Box>
                  <Chip
                    label={integration.status}
                    size="small"
                    color={getStatusColor(integration.status)}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={integration.type}
                    size="small"
                    color={getTypeColor(integration.type)}
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default IntegrationList; 