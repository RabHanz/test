import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

export interface SearchFilters {
  query: string;
  sortBy: 'relevance' | 'newest' | 'popular' | 'rating';
  format: string[];
  experienceLevel: string[];
  duration: [number, number];
  rating: [number, number];
}

interface ResourceSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  initialFilters?: Partial<SearchFilters>;
}

export const ResourceSearch: React.FC<ResourceSearchProps> = ({
  onSearch,
  onClear,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevance',
    format: [],
    experienceLevel: [],
    duration: [0, 120],
    rating: [0, 5],
    ...initialFilters,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      sortBy: 'relevance',
      format: [],
      experienceLevel: [],
      duration: [0, 120],
      rating: [0, 5],
    });
    onClear();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search resources..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {filters.query && (
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />

        {/* Sort and Filter Controls */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })
              }
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="relevance">Relevance</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Advanced Filters">
            <IconButton
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              color={showAdvancedFilters ? 'primary' : 'default'}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Format Filter */}
            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                multiple
                value={filters.format}
                label="Format"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    format: e.target.value as string[],
                  })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="template">Templates</MenuItem>
                <MenuItem value="video">Videos</MenuItem>
                <MenuItem value="guide">Guides</MenuItem>
                <MenuItem value="case-study">Case Studies</MenuItem>
              </Select>
            </FormControl>

            {/* Experience Level Filter */}
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                multiple
                value={filters.experienceLevel}
                label="Experience Level"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    experienceLevel: e.target.value as string[],
                  })
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Active Filters */}
        {(filters.format.length > 0 ||
          filters.experienceLevel.length > 0 ||
          filters.query) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.query && (
              <Chip
                label={`Search: ${filters.query}`}
                onDelete={() => setFilters({ ...filters, query: '' })}
              />
            )}
            {filters.format.map((format) => (
              <Chip
                key={format}
                label={`Format: ${format}`}
                onDelete={() =>
                  setFilters({
                    ...filters,
                    format: filters.format.filter((f) => f !== format),
                  })
                }
              />
            ))}
            {filters.experienceLevel.map((level) => (
              <Chip
                key={level}
                label={`Level: ${level}`}
                onDelete={() =>
                  setFilters({
                    ...filters,
                    experienceLevel: filters.experienceLevel.filter(
                      (l) => l !== level
                    ),
                  })
                }
              />
            ))}
          </Box>
        )}
      </Stack>
    </Paper>
  );
}; 