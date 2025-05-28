import React from 'react';
import { Card, Title, Text, Grid, Col, ProgressBar, Badge } from '@tremor/react';
import { FiAward, FiStar, FiTarget, FiTrendingUp } from 'react-icons/fi';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  points: number;
  isCompleted: boolean;
}

interface AchievementsProps {
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  className?: string;
}

const Achievements: React.FC<AchievementsProps> = ({
  achievements,
  totalPoints,
  level,
  nextLevelPoints,
  className,
}) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <Title>Achievements</Title>
        <div className="flex items-center space-x-2">
          <FiStar className="text-yellow-500" />
          <Text className="font-medium">{totalPoints} Points</Text>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Text>Level {level}</Text>
          <Text>{totalPoints} / {nextLevelPoints} points to next level</Text>
        </div>
        <ProgressBar
          value={(totalPoints / nextLevelPoints) * 100}
          color="blue"
          className="h-2"
        />
      </div>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-6">
        {achievements.map((achievement) => (
          <Col key={achievement.id}>
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-full">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <Text className="font-medium">{achievement.title}</Text>
                  <Text className="text-sm text-gray-500">{achievement.description}</Text>
                </div>
                {achievement.isCompleted && (
                  <Badge color="green" size="sm">
                    Completed
                  </Badge>
                )}
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Text className="text-sm">Progress</Text>
                  <Text className="text-sm">{achievement.progress} / {achievement.total}</Text>
                </div>
                <ProgressBar
                  value={(achievement.progress / achievement.total) * 100}
                  color={achievement.isCompleted ? "green" : "blue"}
                  className="h-2"
                />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <FiAward className="text-yellow-500" />
                  <Text className="text-sm">{achievement.points} points</Text>
                </div>
                {!achievement.isCompleted && (
                  <Badge color="blue" size="sm">
                    In Progress
                  </Badge>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Grid>
    </Card>
  );
};

export default Achievements; 