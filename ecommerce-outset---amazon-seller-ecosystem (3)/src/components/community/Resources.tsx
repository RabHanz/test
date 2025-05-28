import React from 'react';
import { Card, Title, Text, Grid, Col, Badge, Button } from '@tremor/react';
import { FiBook, FiFileText, FiVideo, FiDownload, FiExternalLink } from 'react-icons/fi';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'Document' | 'Video' | 'Course' | 'Template';
  category: string;
  format: string;
  size: string;
  downloads: number;
  rating: number;
  url: string;
}

interface ResourcesProps {
  resources: Resource[];
  className?: string;
}

const Resources: React.FC<ResourcesProps> = ({ resources, className }) => {
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'Document':
        return <FiFileText className="text-blue-500" />;
      case 'Video':
        return <FiVideo className="text-red-500" />;
      case 'Course':
        return <FiBook className="text-green-500" />;
      case 'Template':
        return <FiDownload className="text-purple-500" />;
      default:
        return <FiFileText className="text-gray-500" />;
    }
  };

  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <Title>Community Resources</Title>
        <Button size="sm" variant="secondary">
          Upload Resource
        </Button>
      </div>
      <Text className="mt-2">Access learning materials and templates shared by the community</Text>
      
      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-4 mt-4">
        {resources.map((resource) => (
          <Col key={resource.id}>
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-full">
                  {getResourceIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <Text className="font-medium">{resource.title}</Text>
                  <Text className="text-sm text-gray-500">{resource.description}</Text>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <Badge color="blue" size="sm">
                    {resource.type}
                  </Badge>
                  <Badge color="green" size="sm">
                    {resource.category}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <Text>{resource.format}</Text>
                  <Text>{resource.size}</Text>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <FiDownload className="text-gray-400" />
                    <Text>{resource.downloads} downloads</Text>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiStar className="text-yellow-500" />
                    <Text>{resource.rating.toFixed(1)}</Text>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button size="sm" variant="secondary" icon={FiDownload}>
                  Download
                </Button>
                <Button size="sm" variant="secondary" icon={FiExternalLink}>
                  View
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Grid>
    </Card>
  );
};

export default Resources; 