import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
} from '@mui/material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PersonaType } from '../../types/optimizationHub';
import { LeadCaptureForm } from './LeadCaptureForm';
import { RelatedContent } from './RelatedContent';
import { SocialShare } from './SocialShare';
import { SearchBar } from './SearchBar';
import { CategoryNav } from './CategoryNav';

interface BlogLayoutProps {
  title: string;
  description: string;
  personaType?: PersonaType;
  category?: string;
  children: React.ReactNode;
  relatedPosts?: Array<{
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    personaType: PersonaType;
  }>;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({
  title,
  description,
  personaType,
  category,
  children,
  relatedPosts,
}) => {
  const router = useRouter();
  const currentPath = router.asPath;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
    ...(category ? [{ label: category, href: `/resources/${category}` }] : []),
    ...(personaType ? [{ label: personaType, href: `/resources/${category}/${personaType}` }] : []),
    { label: title, href: currentPath },
  ];

  return (
    <>
      <Head>
        <title>{`${title} | Ecommerce Optimization Resources`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://yourdomain.com${currentPath}`} />
        <meta name="twitter:card" content="summary_large_image" />
        {personaType && <meta name="persona-type" content={personaType} />}
        {category && <meta name="category" content={category} />}
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Left Sidebar - Categories */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 24 }}>
              <CategoryNav currentCategory={category} currentPersona={personaType} />
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs aria-label="breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <Link
                    key={index}
                    href={crumb.href}
                    color={index === breadcrumbs.length - 1 ? 'textPrimary' : 'inherit'}
                    underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
                  >
                    {crumb.label}
                  </Link>
                ))}
              </Breadcrumbs>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h1" component="h1" gutterBottom>
                {title}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" paragraph>
                {description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              {children}
            </Paper>

            <SocialShare url={currentPath} title={title} />
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <SearchBar />
              </Paper>

              <Paper sx={{ p: 2, mb: 3 }}>
                <LeadCaptureForm personaType={personaType} />
              </Paper>

              {relatedPosts && relatedPosts.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <RelatedContent posts={relatedPosts} />
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}; 