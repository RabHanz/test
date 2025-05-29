import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import { PersonaType, Lead } from '../../types/leadScoring';

interface PersonaRoutingProps {
  leads?: Lead[];
}

const getPersonaColor = (persona: PersonaType) => {
  switch (persona) {
    case PersonaType.DECISION_MAKER:
      return 'primary';
    case PersonaType.INFLUENCER:
      return 'secondary';
    case PersonaType.END_USER:
      return 'success';
    case PersonaType.TECHNICAL_EVALUATOR:
      return 'warning';
    default:
      return 'default';
  }
};

const PersonaRouting: React.FC<PersonaRoutingProps> = ({ leads = [] }) => {
  const personaCounts = leads.reduce((acc: Record<PersonaType, number>, lead: Lead) => {
    const persona = lead.demographicData.personaType;
    acc[persona] = (acc[persona] || 0) + 1;
    return acc;
  }, {} as Record<PersonaType, number>);

  const totalLeads = leads.length;

  return (
    <Box>
      <Stack spacing={2}>
        {Object.entries(personaCounts).map(([persona, count]) => (
          <Card key={persona} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  {persona.split('_').map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                </Typography>
                <Chip
                  label={`${count} leads`}
                  color={getPersonaColor(persona as PersonaType)}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={(count / totalLeads) * 100}
                color={getPersonaColor(persona as PersonaType)}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {Math.round((count / totalLeads) * 100)}% of total leads
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default PersonaRouting; 