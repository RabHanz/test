import React from 'react';
import { PersonalizedContent } from '../components/PersonalizedContent';
import { PersonalizedProducts } from '../components/PersonalizedProducts';
import { PersonalizedUI } from '../components/PersonalizedUI';
import { PersonalizedNotifications } from '../components/PersonalizedNotifications';
import { FacebookGroupIntegration } from '../components/FacebookGroupIntegration';
import '../styles/facebook-integration.css';

const HomePage: React.FC = () => {
  return (
    <PersonalizedUI>
      <div className="home-page">
        <section className="hero-section">
          <h1>Welcome to Our E-commerce Portal</h1>
          <PersonalizedContent contentId="welcome" fallbackContent={<p>Welcome to our platform!</p>} />
        </section>

        <section className="featured-products">
          <h2>Featured Products</h2>
          <PersonalizedProducts maxProducts={4} />
        </section>

        <section className="notifications">
          <h2>Important Updates</h2>
          <PersonalizedNotifications maxNotifications={3} />
        </section>

        <section className="community-section">
          <h2>Join Our Community</h2>
          <FacebookGroupIntegration
            showLatestPosts={true}
            showFeaturedDiscussions={true}
            showEvents={true}
            maxPosts={3}
            maxDiscussions={2}
            maxEvents={2}
          />
        </section>
      </div>
    </PersonalizedUI>
  );
};

export default HomePage; 