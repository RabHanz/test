import React from 'react';
import { Card, Title, Text, Grid, Col, Badge, Button, TextInput } from '@tremor/react';
import { FiMessageSquare, FiThumbsUp, FiShare2, FiBookmark, FiSearch } from 'react-icons/fi';

interface Discussion {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: string;
  tags: string[];
  stats: {
    replies: number;
    views: number;
    likes: number;
  };
  lastActivity: string;
  isPinned: boolean;
  isSolved: boolean;
}

interface DiscussionsProps {
  discussions: Discussion[];
  className?: string;
}

const Discussions: React.FC<DiscussionsProps> = ({ discussions, className }) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <Title>Discussions</Title>
        <Button size="sm" variant="secondary">
          Start Discussion
        </Button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <TextInput
            icon={FiSearch}
            placeholder="Search discussions..."
            className="w-full"
          />
        </div>
        <Button size="sm" variant="secondary">
          Filter
        </Button>
      </div>
      
      <Grid numItems={1} className="gap-4">
        {discussions.map((discussion) => (
          <Col key={discussion.id}>
            <Card className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src={discussion.author.avatar}
                    alt={discussion.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Text className="font-medium">{discussion.author.name}</Text>
                      <Text className="text-sm text-gray-500">{discussion.author.role}</Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      {discussion.isPinned && (
                        <Badge color="yellow" size="sm">
                          Pinned
                        </Badge>
                      )}
                      {discussion.isSolved && (
                        <Badge color="green" size="sm">
                          Solved
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Title className="text-lg mb-2">{discussion.title}</Title>
                  <Text className="text-gray-600 mb-4">{discussion.content}</Text>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge color="blue" size="sm">
                      {discussion.category}
                    </Badge>
                    {discussion.tags.map((tag) => (
                      <Badge key={tag} color="gray" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
                        <FiMessageSquare />
                        <Text className="text-sm">{discussion.stats.replies}</Text>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500">
                        <FiThumbsUp />
                        <Text className="text-sm">{discussion.stats.likes}</Text>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-500">
                        <FiShare2 />
                        <Text className="text-sm">Share</Text>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-yellow-500">
                        <FiBookmark />
                        <Text className="text-sm">Save</Text>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <Text>{discussion.stats.views} views</Text>
                      <Text>Last activity: {discussion.lastActivity}</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>
    </Card>
  );
};

export default Discussions; 