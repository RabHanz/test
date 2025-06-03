import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Typography,
  Box,
  Chip,
  Collapse,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { AutomationRule, ActionType, ConditionOperator } from '../../types/leadScoring';

interface AutomationRulesProps {
  rules?: AutomationRule[];
  onEditRule?: (ruleId: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onToggleRule?: (ruleId: string, enabled: boolean) => void;
}

const AutomationRules: React.FC<AutomationRulesProps> = ({
  rules = [],
  onEditRule,
  onDeleteRule,
  onToggleRule,
}) => {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const toggleExpand = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  const formatCondition = (condition: { field: string; operator: ConditionOperator; value: any }) => {
    return `${condition.field} ${condition.operator.toLowerCase()} ${condition.value}`;
  };

  const formatAction = (action: { type: ActionType; target: string; parameters: Record<string, any> }) => {
    return `${action.type.toLowerCase()} ${action.target}`;
  };

  return (
    <Box>
      <List>
        {rules.map((rule) => (
          <React.Fragment key={rule.id}>
            <ListItem
              button
              onClick={() => toggleExpand(rule.id)}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{rule.name}</Typography>
                    <Chip
                      label={`Priority: ${rule.priority}`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                }
                secondary={`${rule.conditions.length} conditions, ${rule.actions.length} actions`}
              />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={rule.enabled}
                  onChange={(e) => onToggleRule?.(rule.id, e.target.checked)}
                />
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRule?.(rule.id);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteRule?.(rule.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
                {expandedRule === rule.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemSecondaryAction>
            </ListItem>
            <Collapse in={expandedRule === rule.id}>
              <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Conditions:
                </Typography>
                {rule.conditions.map((condition, index) => (
                  <Chip
                    key={index}
                    label={formatCondition(condition)}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Actions:
                </Typography>
                {rule.actions.map((action, index) => (
                  <Chip
                    key={index}
                    label={formatAction(action)}
                    size="small"
                    color="primary"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => onEditRule?.('new')}
      >
        Add New Rule
      </Button>
    </Box>
  );
};

export default AutomationRules; 