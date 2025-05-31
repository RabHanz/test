import React from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  CircularProgress,
  Popper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { PersonaType } from '../../types/optimizationHub';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  personaType?: PersonaType;
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search articles...',
}) => {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const searchTimeout = React.useRef<NodeJS.Timeout>();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Simulate API response
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'How to Optimize Your Amazon Listings',
          excerpt: 'Learn the best practices for optimizing your Amazon product listings...',
          category: 'optimization',
          personaType: 'STARTER',
        },
        {
          id: '2',
          title: 'Advanced Revenue Optimization Strategies',
          excerpt: 'Discover advanced techniques for maximizing your revenue...',
          category: 'optimization',
          personaType: 'ENTERPRISE',
        },
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    setAnchorEl(event.currentTarget);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      handleSearch(newQuery);
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setAnchorEl(null);
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(`/resources/${result.category}/${result.id}`);
    handleClear();
  };

  const open = Boolean(anchorEl) && (query.length > 0 || results.length > 0);

  return (
    <Box sx={{ position: 'relative' }}>
      <Paper
        component="form"
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          inputProps={{ 'aria-label': 'search articles' }}
        />
        {loading && (
          <CircularProgress size={20} sx={{ mx: 1 }} />
        )}
        {query && (
          <IconButton
            sx={{ p: '10px' }}
            aria-label="clear"
            onClick={handleClear}
          >
            <ClearIcon />
          </IconButton>
        )}
      </Paper>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ width: anchorEl?.offsetWidth, zIndex: 1300 }}
      >
        <Paper
          elevation={3}
          sx={{
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {results.length > 0 ? (
            <List>
              {results.map((result, index) => (
                <React.Fragment key={result.id}>
                  <ListItem
                    button
                    onClick={() => handleResultClick(result)}
                  >
                    <ListItemText
                      primary={result.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.excerpt}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.category}
                            {result.personaType && ` • ${result.personaType}`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No results found
              </Typography>
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}; 