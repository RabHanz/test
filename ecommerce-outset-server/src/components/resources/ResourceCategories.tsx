import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon,
  Label as LabelIcon,
} from '@mui/icons-material';

interface Category {
  id: string;
  name: string;
  description: string;
  subcategories?: Category[];
  tags: string[];
}

interface ResourceCategoriesProps {
  categories: Category[];
  selectedCategories: string[];
  selectedTags: string[];
  onCategorySelect: (categoryId: string) => void;
  onTagSelect: (tag: string) => void;
}

export const ResourceCategories: React.FC<ResourceCategoriesProps> = ({
  categories,
  selectedCategories,
  selectedTags,
  onCategorySelect,
  onTagSelect,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <React.Fragment key={category.id}>
        <ListItem
          sx={{
            pl: level * 2,
            bgcolor: isSelected ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon>
            <FolderIcon color={isSelected ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText
            primary={category.name}
            secondary={category.description}
            onClick={() => onCategorySelect(category.id)}
            sx={{ cursor: 'pointer' }}
          />
          {category.subcategories && (
            <IconButton
              edge="end"
              onClick={() => toggleCategory(category.id)}
              size="small"
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </ListItem>

        {category.subcategories && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {category.subcategories.map((subcategory) =>
                renderCategory(subcategory, level + 1)
              )}
            </List>
          </Collapse>
        )}

        {category.tags.length > 0 && (
          <Box sx={{ pl: level * 2 + 4, pr: 2, pb: 1 }}>
            {category.tags.map((tag) => (
              <Tooltip key={tag} title={`Filter by ${tag}`}>
                <Chip
                  label={tag}
                  size="small"
                  icon={<LabelIcon />}
                  onClick={() => onTagSelect(tag)}
                  color={selectedTags.includes(tag) ? 'primary' : 'default'}
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              </Tooltip>
            ))}
          </Box>
        )}
      </React.Fragment>
    );
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Categories & Tags
      </Typography>
      <List>
        {categories.map((category) => renderCategory(category))}
      </List>
    </Paper>
  );
}; 