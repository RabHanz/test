import React from 'react';
import { Card, Title, Text, Grid, Col, Badge, Button } from '@tremor/react';
import { FiUsers, FiCalendar, FiClock, FiBook, FiVideo } from 'react-icons/fi';

interface StudyGroup {
  id: string;
  name: string;
  topic: string;
  description: string;
  members: number;
  maxMembers: number;
  schedule: string;
  nextSession: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  format: 'Virtual' | 'In-Person' | 'Hybrid';
}

interface StudyGroupsProps {
  groups: StudyGroup[];
  className?: string;
}

const StudyGroups: React.FC<StudyGroupsProps> = ({ groups, className }) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <Title>Study Groups</Title>
        <Button size="sm" variant="secondary">
          Create Group
        </Button>
      </div>
      <Text className="mt-2">Join study groups to learn and collaborate with peers</Text>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-4">
        {groups.map((group) => (
          <Col key={group.id}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-blue-500" />
                  <Text className="font-medium">{group.name}</Text>
                </div>
                <Badge color="blue" size="sm">
                  {group.level}
                </Badge>
              </div>
              
              <Text className="text-sm text-gray-500 mb-4">{group.description}</Text>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FiBook className="text-gray-400" />
                  <Text className="text-sm">{group.topic}</Text>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-400" />
                  <Text className="text-sm">{group.schedule}</Text>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiClock className="text-gray-400" />
                  <Text className="text-sm">Next: {group.nextSession}</Text>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiVideo className="text-gray-400" />
                  <Text className="text-sm">{group.format}</Text>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiUsers className="text-gray-400" />
                  <Text className="text-sm">
                    {group.members} / {group.maxMembers} members
                  </Text>
                </div>
                <Button size="sm" variant="secondary">
                  Join Group
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>
    </Card>
  );
};

export default StudyGroups; 