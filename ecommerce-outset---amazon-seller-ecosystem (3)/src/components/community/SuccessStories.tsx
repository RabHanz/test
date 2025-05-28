import React from 'react';
import { Card, Title, Text, Grid, Col, Avatar, Badge } from '@tremor/react';
import { FiAward, FiTrendingUp, FiDollarSign, FiStar } from 'react-icons/fi';

interface SuccessStory {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  title: string;
  content: string;
  metrics: {
    revenue: number;
    growth: number;
    timeToSuccess: string;
  };
  tags: string[];
  date: string;
}

interface SuccessStoriesProps {
  stories: SuccessStory[];
  className?: string;
}

const SuccessStories: React.FC<SuccessStoriesProps> = ({ stories, className }) => {
  return (
    <Card className={className}>
      <Title>Success Stories</Title>
      <Text className="mt-2">Inspiring stories from our community members</Text>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-4">
        {stories.map((story) => (
          <Col key={story.id}>
            <Card className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar
                  src={story.author.avatar}
                  alt={story.author.name}
                  size="lg"
                  className="rounded-full"
                />
                <div>
                  <Text className="font-medium">{story.author.name}</Text>
                  <Text className="text-sm text-gray-500">{story.author.role}</Text>
                </div>
              </div>
              
              <Title className="text-lg mb-2">{story.title}</Title>
              <Text className="text-gray-600 mb-4">{story.content}</Text>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col items-center p-2 bg-blue-50 rounded-lg">
                  <FiDollarSign className="text-blue-500 mb-1" />
                  <Text className="text-sm font-medium">${story.metrics.revenue.toLocaleString()}</Text>
                  <Text className="text-xs text-gray-500">Revenue</Text>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg">
                  <FiTrendingUp className="text-green-500 mb-1" />
                  <Text className="text-sm font-medium">{story.metrics.growth}%</Text>
                  <Text className="text-xs text-gray-500">Growth</Text>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
                  <FiAward className="text-purple-500 mb-1" />
                  <Text className="text-sm font-medium">{story.metrics.timeToSuccess}</Text>
                  <Text className="text-xs text-gray-500">Time to Success</Text>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {story.tags.map((tag) => (
                  <Badge key={tag} color="blue" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiStar className="text-yellow-500" />
                  <Text>Featured Story</Text>
                </div>
                <Text>{story.date}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>
    </Card>
  );
};

export default SuccessStories; 