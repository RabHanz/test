import React from 'react';
import { Card, Title, Text, List, ListItem, Badge } from '@tremor/react';
import { FiThumbsUp, FiMessageSquare, FiShare2 } from 'react-icons/fi';

interface FacebookPost {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

interface FacebookGroupActivityProps {
  posts: FacebookPost[];
  className?: string;
}

const FacebookGroupActivity: React.FC<FacebookGroupActivityProps> = ({ posts, className }) => {
  return (
    <Card className={className}>
      <Title>Facebook Group Activity</Title>
      <Text className="mt-2">Recent posts and interactions from our Facebook community</Text>
      
      <List className="mt-4">
        {posts.map((post) => (
          <ListItem key={post.id} className="border-b border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Text className="font-medium">{post.author}</Text>
                <Text className="text-sm text-gray-500">{post.timestamp}</Text>
              </div>
              
              <Text className="text-gray-700">{post.content}</Text>
              
              <div className="flex items-center space-x-4 mt-2">
                <Badge icon={FiThumbsUp} color="blue">
                  {post.likes}
                </Badge>
                <Badge icon={FiMessageSquare} color="green">
                  {post.comments}
                </Badge>
                <Badge icon={FiShare2} color="purple">
                  {post.shares}
                </Badge>
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

export default FacebookGroupActivity; 