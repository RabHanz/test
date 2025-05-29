import React from 'react';
import { useRouter } from 'next/router';
import { Container, Grid, Typography, Box, Chip } from '@mui/material';
import { BlogLayout } from '../../../components/blog/BlogLayout';
import { CategoryNav } from '../../../components/blog/CategoryNav';
import { LeadCapture } from '../../../components/blog/LeadCapture';
import { RelatedContent } from '../../../components/blog/RelatedContent';
import { SocialShare } from '../../../components/blog/SocialShare';
import { SearchBar } from '../../../components/blog/SearchBar';
import { PersonaType } from '../../../types/optimizationHub';

// Mock data for demonstration
const mockPost = {
  id: '1',
  title: 'How to Optimize Your Amazon Listings for Maximum Visibility',
  description: 'Learn the best practices for optimizing your Amazon product listings to increase visibility and drive more sales.',
  content: `
    <h2>Introduction</h2>
    <p>Optimizing your Amazon listings is crucial for success in the competitive e-commerce landscape. This comprehensive guide will walk you through the essential steps to improve your product visibility and conversion rates.</p>

    <h2>1. Keyword Research</h2>
    <p>Start by identifying the most relevant and high-performing keywords for your product. Use tools like Amazon's search bar suggestions and third-party keyword research tools to find the best terms.</p>

    <h2>2. Title Optimization</h2>
    <p>Your product title should include the most important keywords while remaining clear and concise. Follow Amazon's title guidelines and include key product attributes.</p>

    <h2>3. Bullet Points and Description</h2>
    <p>Use bullet points to highlight key features and benefits. Write a detailed description that addresses customer pain points and includes relevant keywords naturally.</p>

    <h2>4. Images and Media</h2>
    <p>High-quality images are essential. Include multiple angles, lifestyle shots, and infographics that showcase your product's features and benefits.</p>

    <h2>5. Pricing Strategy</h2>
    <p>Research your competitors' pricing and position your product accordingly. Consider using dynamic pricing tools to stay competitive.</p>

    <h2>Conclusion</h2>
    <p>By following these optimization strategies, you can improve your Amazon listing's visibility and increase your chances of success in the marketplace.</p>
  `,
  category: 'optimization',
  personaType: 'STARTER' as PersonaType,
  readTime: 8,
  author: {
    name: 'John Doe',
    role: 'E-commerce Expert',
    avatar: '/images/author.jpg',
  },
  publishDate: '2024-03-15',
  tags: ['Amazon', 'SEO', 'Product Listing', 'E-commerce'],
};

const mockRelatedPosts = [
  {
    id: '2',
    title: 'Advanced Amazon SEO Techniques',
    excerpt: 'Discover advanced techniques for improving your Amazon product visibility...',
    category: 'optimization',
    personaType: 'GROWTH' as PersonaType,
    readTime: 10,
    imageUrl: '/images/advanced-seo.jpg',
  },
  {
    id: '3',
    title: 'Product Photography Tips for Amazon',
    excerpt: 'Learn how to take professional product photos that convert...',
    category: 'optimization',
    personaType: 'STARTER' as PersonaType,
    readTime: 6,
    imageUrl: '/images/photography.jpg',
  },
];

export default function BlogPost() {
  const router = useRouter();
  const { category, id } = router.query;

  // In a real application, you would fetch the post data based on the category and id
  const post = mockPost;
  const relatedPosts = mockRelatedPosts;

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <BlogLayout
      title={post.title}
      description={post.description}
      personaType={post.personaType}
      category={post.category}
      relatedPosts={relatedPosts}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <SearchBar />
              <Box sx={{ mt: 3 }}>
                <CategoryNav
                  currentCategory={post.category}
                  currentPersona={post.personaType}
                />
              </Box>
            </Box>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {post.title}
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {post.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
              <Box sx={{ mb: 3 }}>
                <SocialShare
                  url={`https://yourdomain.com/resources/${post.category}/${post.id}`}
                  title={post.title}
                  description={post.description}
                />
              </Box>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </Box>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <LeadCapture
                personaType={post.personaType}
                category={post.category}
              />
              <RelatedContent
                posts={relatedPosts}
                currentPostId={post.id}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </BlogLayout>
  );
} 