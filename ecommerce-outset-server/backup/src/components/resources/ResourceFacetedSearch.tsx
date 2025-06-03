import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  TextField,
  InputAdornment,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import {
  resourceCategories,
  resourceFormats,
  experienceLevels,
  ResourceCategory,
  ResourceFormat,
  ExperienceLevel,
} from '../../config/resourceClassification';

interface ResourceFacetedSearchProps {
  onFilterChange: (filters: ResourceFilters) => void;
}

export interface ResourceFilters {
  search: string;
  categories: string[];
  formats: string[];
  experienceLevels: string[];
  personaTypes: string[];
  ratingRange: [number, number];
  durationRange: [number, number];
}

export const ResourceFacetedSearch: React.FC<ResourceFacetedSearchProps> = ({
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    categories: [],
    formats: [],
    experienceLevels: [],
    personaTypes: [],
    ratingRange: [0, 5],
    durationRange: [0, 120],
  });

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    categories: true,
    formats: true,
    experienceLevels: true,
    rating: true,
    duration: true,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: event.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFormatChange = (formatId: string) => {
    const newFormats = filters.formats.includes(formatId)
      ? filters.formats.filter((id) => id !== formatId)
      : [...filters.formats, formatId];
    const newFilters = { ...filters, formats: newFormats };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleExperienceLevelChange = (levelId: string) => {
    const newLevels = filters.experienceLevels.includes(levelId)
      ? filters.experienceLevels.filter((id) => id !== levelId)
      : [...filters.experienceLevels, levelId];
    const newFilters = { ...filters, experienceLevels: newLevels };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (event: Event, newValue: number | number[]) => {
    const newFilters = { ...filters, ratingRange: newValue as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDurationChange = (event: Event, newValue: number | number[]) => {
    const newFilters = { ...filters, durationRange: newValue as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSection = (
    title: string,
    section: string,
    content: React.ReactNode
  ) => (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          size="small"
          onClick={() => toggleSection(section)}
          aria-label={expandedSections[section] ? 'collapse' : 'expand'}
        >
          {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expandedSections[section]} timeout="auto" unmountOnExit>
        {content}
      </Collapse>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search resources..."
        value={filters.search}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {renderSection(
        'Categories',
        'categories',
        <FormGroup>
          {resourceCategories.map((category) => (
            <FormControlLabel
              key={category.id}
              control={
                <Checkbox
                  checked={filters.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{category.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      )}

      {renderSection(
        'Formats',
        'formats',
        <FormGroup>
          {resourceFormats.map((format) => (
            <FormControlLabel
              key={format.id}
              control={
                <Checkbox
                  checked={filters.formats.includes(format.id)}
                  onChange={() => handleFormatChange(format.id)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{format.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      )}

      {renderSection(
        'Experience Level',
        'experienceLevels',
        <FormGroup>
          {experienceLevels.map((level) => (
            <FormControlLabel
              key={level.id}
              control={
                <Checkbox
                  checked={filters.experienceLevels.includes(level.id)}
                  onChange={() => handleExperienceLevelChange(level.id)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{level.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {level.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      )}

      {renderSection(
        'Rating',
        'rating',
        <Box sx={{ px: 2 }}>
          <Slider
            value={filters.ratingRange}
            onChange={handleRatingChange}
            valueLabelDisplay="auto"
            min={0}
            max={5}
            step={0.5}
            marks={[
              { value: 0, label: '0' },
              { value: 5, label: '5' },
            ]}
          />
        </Box>
      )}

      {renderSection(
        'Duration (minutes)',
        'duration',
        <Box sx={{ px: 2 }}>
          <Slider
            value={filters.durationRange}
            onChange={handleDurationChange}
            valueLabelDisplay="auto"
            min={0}
            max={120}
            step={5}
            marks={[
              { value: 0, label: '0' },
              { value: 60, label: '60' },
              { value: 120, label: '120' },
            ]}
          />
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Active Filters
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.categories.map((categoryId) => {
            const category = resourceCategories.find((c) => c.id === categoryId);
            return (
              <Chip
                key={categoryId}
                label={category?.name}
                onDelete={() => handleCategoryChange(categoryId)}
                size="small"
              />
            );
          })}
          {filters.formats.map((formatId) => {
            const format = resourceFormats.find((f) => f.id === formatId);
            return (
              <Chip
                key={formatId}
                label={format?.name}
                onDelete={() => handleFormatChange(formatId)}
                size="small"
              />
            );
          })}
          {filters.experienceLevels.map((levelId) => {
            const level = experienceLevels.find((l) => l.id === levelId);
            return (
              <Chip
                key={levelId}
                label={level?.name}
                onDelete={() => handleExperienceLevelChange(levelId)}
                size="small"
              />
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}; 