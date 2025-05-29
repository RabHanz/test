import React from 'react';
import { useRouter } from 'next/router';
import { PersonalizedContent } from '../../components/PersonalizedContent';
import { PersonalizedProducts } from '../../components/PersonalizedProducts';
import { PersonalizedUI } from '../../components/PersonalizedUI';
import { PersonalizedNotifications } from '../../components/PersonalizedNotifications';
import { FacebookGroupIntegration } from '../../components/FacebookGroupIntegration';
import { PersonaType } from '../../types/personalization';
import '../../styles/facebook-integration.css';

const PersonaPage: React.FC = () => {
  const router = useRouter();
  const { type } = router.query;
  const personaType = type as PersonaType;

  const getPersonaHashtags = (type: string) => {
    const hashtags = {
      StartupSam: ['#LaunchJourney', '#FirstProduct', '#BeginnerSeller'],
      ScalingSarah: ['#ScaleUp', '#Optimization', '#6FigureSeller'],
      LearningLarry: ['#AmazonEducation', '#DeepDive', '#Frameworks'],
      InvestorIan: ['#AmazonInvesting', '#BusinessAcquisition', '#Portfolio'],
      ProviderPriya: ['#ServiceProviders', '#Networking', '#Expertise']
    };
    return hashtags[type as keyof typeof hashtags] || [];
  };

  return (
    <PersonalizedUI>
      <div className="persona-page">
        <section className="persona-header">
          <h1>{`${personaType} Persona Dashboard`}</h1>
          <PersonalizedContent 
            contentId={`${personaType}-welcome`} 
            fallbackContent={<p>Welcome to your personalized dashboard!</p>} 
          />
        </section>

        <section className="persona-resources">
          <h2>Recommended Resources</h2>
          <PersonalizedProducts maxProducts={6} />
        </section>

        <section className="persona-notifications">
          <h2>Your Updates</h2>
          <PersonalizedNotifications maxNotifications={5} />
        </section>

        <section className="persona-community">
          <h2>Community Content for {personaType}</h2>
          <div className="hashtags">
            {getPersonaHashtags(personaType).map(tag => (
              <span key={tag} className="hashtag">{tag}</span>
            ))}
          </div>
          <FacebookGroupIntegration
            personaType={personaType}
            showLatestPosts={true}
            showFeaturedDiscussions={true}
            showEvents={true}
            maxPosts={4}
            maxDiscussions={3}
            maxEvents={2}
          />
        </section>
      </div>
    </PersonalizedUI>
  );
};

export default PersonaPage; 