import React from 'react';
import { Card, Title, Text, Grid, Col, Avatar, Badge } from '@tremor/react';
import { FiAward, FiMessageSquare, FiMail } from 'react-icons/fi';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  expertise: string[];
  achievements: number;
  contributions: number;
  isOnline: boolean;
}

interface MemberDirectoryProps {
  members: Member[];
  className?: string;
}

const MemberDirectory: React.FC<MemberDirectoryProps> = ({ members, className }) => {
  return (
    <Card className={className}>
      <Title>Member Directory</Title>
      <Text className="mt-2">Connect with community members and experts</Text>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-4">
        {members.map((member) => (
          <Col key={member.id}>
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={member.avatar}
                  alt={member.name}
                  size="lg"
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Text className="font-medium">{member.name}</Text>
                    {member.isOnline && (
                      <Badge color="green" size="sm">
                        Online
                      </Badge>
                    )}
                  </div>
                  <Text className="text-sm text-gray-500">{member.role}</Text>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {member.expertise.map((skill) => (
                    <Badge key={skill} color="blue" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <FiAward className="text-yellow-500" />
                  <Text className="text-sm">{member.achievements} achievements</Text>
                </div>
                <div className="flex items-center space-x-2">
                  <FiMessageSquare className="text-blue-500" />
                  <Text className="text-sm">{member.contributions} contributions</Text>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-full">
                  <FiMessageSquare />
                </button>
                <button className="p-2 text-green-500 hover:bg-green-50 rounded-full">
                  <FiMail />
                </button>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>
    </Card>
  );
};

export default MemberDirectory; 