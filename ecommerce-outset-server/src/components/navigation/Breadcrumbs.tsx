import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import { useRouter } from 'next/router';
import { navigationConfig } from '../../config/navigation';

interface BreadcrumbProps {
  customPath?: string[];
  customLabels?: string[];
}

export const Breadcrumbs: React.FC<BreadcrumbProps> = ({
  customPath,
  customLabels,
}) => {
  const router = useRouter();
  const pathSegments = customPath || router.asPath.split('/').filter(Boolean);
  const labels = customLabels || [];

  const findNavigationItem = (path: string): any => {
    const findInItems = (items: any[]): any => {
      for (const item of items) {
        if (item.path === `/${path}`) return item;
        if (item.children) {
          const found = findInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInItems(navigationConfig);
  };

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const navItem = findNavigationItem(segment);
    const label = labels[index] || navItem?.title || segment;

    return {
      label,
      path,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <Box sx={{ py: 2 }}>
      <MuiBreadcrumbs aria-label="breadcrumb">
        <Link
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            router.push('/');
          }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Home
        </Link>
        {breadcrumbs.map((breadcrumb, index) => {
          if (breadcrumb.isLast) {
            return (
              <Typography
                key={breadcrumb.path}
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {breadcrumb.label}
              </Typography>
            );
          }
          return (
            <Link
              key={breadcrumb.path}
              color="inherit"
              href={breadcrumb.path}
              onClick={(e) => {
                e.preventDefault();
                router.push(breadcrumb.path);
              }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {breadcrumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}; 