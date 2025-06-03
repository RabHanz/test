import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { IntegrationProject, IntegrationType, IntegrationProtocol, IntegrationSecurityType } from '../../types/integration';

interface CreateIntegrationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (integration: Partial<IntegrationProject>) => Promise<void>;
}

export const CreateIntegrationDialog: React.FC<CreateIntegrationDialogProps> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = React.useState<Partial<IntegrationProject>>({
    name: '',
    description: '',
    type: IntegrationType.API,
    protocol: IntegrationProtocol.REST,
    sourceSystem: '',
    targetSystem: '',
    endpointUrl: '',
    securityType: IntegrationSecurityType.NONE,
    credentials: {},
    config: {},
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (field: keyof IntegrationProject) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await onCreate(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create integration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Integration</DialogTitle>
      <DialogContent>
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Name"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Type"
              >
                {Object.values(IntegrationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Protocol</InputLabel>
              <Select
                value={formData.protocol}
                onChange={handleChange('protocol')}
                label="Protocol"
              >
                {Object.values(IntegrationProtocol).map((protocol) => (
                  <MenuItem key={protocol} value={protocol}>
                    {protocol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Source System"
              value={formData.sourceSystem}
              onChange={handleChange('sourceSystem')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Target System"
              value={formData.targetSystem}
              onChange={handleChange('targetSystem')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Endpoint URL"
              value={formData.endpointUrl}
              onChange={handleChange('endpointUrl')}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Security Type</InputLabel>
              <Select
                value={formData.securityType}
                onChange={handleChange('securityType')}
                label="Security Type"
              >
                {Object.values(IntegrationSecurityType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Integration'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 