import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Typography,
  Box,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ShoppingCart,
  TrendingUp,
  Analytics,
  People,
  Settings,
} from '@mui/icons-material';
import { PersonaType } from '../../types/optimizationHub';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories?: Array<{
    id: string;
    name: string;
    personaTypes?: PersonaType[];
  }>;
}

const categories: Category[] = [
  {
    id: 'optimization',
    name: 'Optimization',
    icon: <TrendingUp />,
    subcategories: [
      {
        id: 'conversion',
        name: 'Conversion Rate',
        personaTypes: ['STARTER', 'GROWTH', 'ENTERPRISE'],
      },
      {
        id: 'revenue',
        name: 'Revenue Value',
        personaTypes: ['GROWTH', 'ENTERPRISE'],
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: <Analytics />,
    subcategories: [
      {
        id: 'performance',
        name: 'Performance Metrics',
        personaTypes: ['STARTER', 'GROWTH', 'ENTERPRISE'],
      },
      {
        id: 'reporting',
        name: 'Reporting & Insights',
        personaTypes: ['GROWTH', 'ENTERPRISE'],
      },
    ],
  },
  {
    id: 'personas',
    name: 'Persona Guides',
    icon: <People />,
    subcategories: [
      {
        id: 'starter',
        name: 'Starter Guide',
        personaTypes: ['STARTER'],
      },
      {
        id: 'growth',
        name: 'Growth Strategies',
        personaTypes: ['GROWTH'],
      },
      {
        id: 'enterprise',
        name: 'Enterprise Solutions',
        personaTypes: ['ENTERPRISE'],
      },
    ],
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: <Settings />,
    subcategories: [
      {
        id: 'platforms',
        name: 'Platform Setup',
        personaTypes: ['STARTER', 'GROWTH', 'ENTERPRISE'],
      },
      {
        id: 'automation',
        name: 'Automation Tools',
        personaTypes: ['GROWTH', 'ENTERPRISE'],
      },
    ],
  },
];

interface CategoryNavProps {
  currentCategory?: string;
  currentPersona?: PersonaType;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  currentCategory,
  currentPersona,
}) => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleExpand = (categoryId: string) => {
    setExpanded(expanded === categoryId ? false : categoryId);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Categories
      </Typography>
      <List component="nav">
        {categories.map((category) => (
          <React.Fragment key={category.id}>
            <ListItem
              button
              onClick={() => handleExpand(category.id)}
              selected={currentCategory === category.id}
            >
              <ListItemIcon>{category.icon}</ListItemIcon>
              <ListItemText primary={category.name} />
              {category.subcategories && (
                expanded === category.id ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItem>
            {category.subcategories && (
              <Collapse
                in={expanded === category.id}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={`/resources/${category.id}/${subcategory.id}`}
                      passHref
                    >
                      <ListItem
                        button
                        sx={{ pl: 4 }}
                        selected={
                          currentCategory === category.id &&
                          currentPersona &&
                          subcategory.personaTypes?.includes(currentPersona)
                        }
                      >
                        <ListItemText primary={subcategory.name} />
                      </ListItem>
                    </Link>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}; 