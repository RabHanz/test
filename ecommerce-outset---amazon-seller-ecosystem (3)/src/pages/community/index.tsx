import React from 'react';
import CommunityDashboard from '../../components/community/CommunityDashboard';
import FacebookGroupActivity from '../../components/community/FacebookGroupActivity';
import MemberDirectory from '../../components/community/MemberDirectory';
import StudyGroups from '../../components/community/StudyGroups';
import Discussions from '../../components/community/Discussions';
import Resources from '../../components/community/Resources';
import SuccessStories from '../../components/community/SuccessStories';
import Achievements from '../../components/community/Achievements';
import { FiAward } from 'react-icons/fi';

// Mock data for demonstration
const mockFacebookPosts = [
  {
    id: '1',
    author: 'John Doe',
    content: 'Just completed the Amazon FBA course!',
    timestamp: '2 hours ago',
    likes: 15,
    comments: 5,
    shares: 2,
  },
  // Add more mock posts...
];

const mockMembers = [
  {
    id: '1',
    name: 'Jane Smith',
    avatar: '/avatars/jane.jpg',
    role: 'Expert Seller',
    expertise: ['Amazon FBA', 'Product Research'],
    achievements: 12,
    contributions: 45,
    isOnline: true,
  },
  // Add more mock members...
];

const mockStudyGroups = [
  {
    id: '1',
    name: 'Amazon FBA Mastery',
    topic: 'Amazon FBA',
    description: 'Learn advanced FBA strategies',
    members: 15,
    maxMembers: 20,
    schedule: 'Weekly',
    nextSession: 'Tomorrow, 2 PM EST',
    level: 'Intermediate',
    format: 'Virtual',
  },
  // Add more mock groups...
];

const mockDiscussions = [
  {
    id: '1',
    title: 'Best practices for product research',
    content: 'What tools do you use for product research?',
    author: {
      name: 'Mike Johnson',
      avatar: '/avatars/mike.jpg',
      role: 'Community Member',
    },
    category: 'Product Research',
    tags: ['research', 'tools', 'amazon'],
    stats: {
      replies: 8,
      views: 120,
      likes: 15,
    },
    lastActivity: '1 hour ago',
    isPinned: true,
    isSolved: false,
  },
  // Add more mock discussions...
];

const mockResources = [
  {
    id: '1',
    title: 'Amazon FBA Guide',
    description: 'Complete guide to Amazon FBA',
    type: 'Document',
    category: 'Guides',
    format: 'PDF',
    size: '2.5 MB',
    downloads: 150,
    rating: 4.8,
    url: '/resources/fba-guide.pdf',
  },
  // Add more mock resources...
];

const mockSuccessStories = [
  {
    id: '1',
    author: {
      name: 'Sarah Wilson',
      avatar: '/avatars/sarah.jpg',
      role: 'Top Seller',
    },
    title: 'From $0 to $50k in 6 months',
    content: 'How I built my Amazon business...',
    metrics: {
      revenue: 50000,
      growth: 150,
      timeToSuccess: '6 months',
    },
    tags: ['success', 'case-study', 'amazon'],
    date: '2 weeks ago',
  },
  // Add more mock stories...
];

const mockAchievements = [
  {
    id: '1',
    title: 'First Sale',
    description: 'Complete your first sale on Amazon',
    icon: <FiAward />,
    progress: 1,
    total: 1,
    points: 100,
    isCompleted: true,
  },
  // Add more mock achievements...
];

const CommunityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <CommunityDashboard />
        
        <div className="mt-8">
          <FacebookGroupActivity posts={mockFacebookPosts} />
        </div>
        
        <div className="mt-8">
          <MemberDirectory members={mockMembers} />
        </div>
        
        <div className="mt-8">
          <StudyGroups groups={mockStudyGroups} />
        </div>
        
        <div className="mt-8">
          <Discussions discussions={mockDiscussions} />
        </div>
        
        <div className="mt-8">
          <Resources resources={mockResources} />
        </div>
        
        <div className="mt-8">
          <SuccessStories stories={mockSuccessStories} />
        </div>
        
        <div className="mt-8">
          <Achievements
            achievements={mockAchievements}
            totalPoints={1250}
            level={5}
            nextLevelPoints={2000}
          />
        </div>
      </main>
    </div>
  );
};

export default CommunityPage; 