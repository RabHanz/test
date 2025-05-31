import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { navigationConfig, NavigationItem } from '../../config/navigation';

export const GlobalNav: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      setExpandedItems((prev) => {
        const next = new Set(prev);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
    } else {
      router.push(item.path);
      setMobileOpen(false);
    }
  };

  const renderNavItem = (item: NavigationItem, isNested = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    if (isMobile) {
      return (
        <React.Fragment key={item.id}>
          <ListItem
            button
            onClick={() => handleItemClick(item)}
            sx={{
              pl: isNested ? 4 : 2,
              py: 1,
            }}
          >
            {item.icon && (
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
            )}
            <ListItemText primary={item.title} />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItem>
          {hasChildren && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => renderNavItem(child, true))}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    return (
      <Box
        key={item.id}
        sx={{
          position: 'relative',
          '&:hover > .MuiMenu-root': {
            display: 'block',
          },
        }}
      >
        <Button
          color="inherit"
          onClick={() => handleItemClick(item)}
          sx={{
            mx: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          {item.icon && <item.icon sx={{ mr: 1 }} />}
          {item.title}
          {hasChildren && <ExpandMore />}
        </Button>
        {hasChildren && (
          <Menu
            anchorEl={null}
            open={false}
            onClose={() => {}}
            sx={{
              display: 'none',
              '& .MuiPaper-root': {
                mt: 1,
                minWidth: 200,
              },
            }}
          >
            {item.children.map((child) => (
              <MenuItem
                key={child.id}
                onClick={() => {
                  router.push(child.path);
                }}
              >
                {child.icon && <child.icon sx={{ mr: 1 }} />}
                <Box>
                  <Typography variant="subtitle2">{child.title}</Typography>
                  {child.description && (
                    <Typography variant="caption" color="text.secondary">
                      {child.description}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        )}
      </Box>
    );
  };

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        {navigationConfig.map((item) => renderNavItem(item))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Your Brand
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              {navigationConfig.map((item) => renderNavItem(item))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Toolbar /> {/* Spacer for fixed AppBar */}
    </>
  );
}; 