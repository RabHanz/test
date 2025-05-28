import React, { useState } from 'react';
import { Card, Title, Text, Badge, Button, List, ListItem } from '@tremor/react';
import { FiMenu, FiSearch, FiPlus, FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  lastContact: string;
}

const MobileCRM: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const leads: Lead[] = [
    {
      id: '1',
      name: 'John Doe',
      company: 'Acme Corp',
      email: 'john@acme.com',
      phone: '+1 234 567 890',
      status: 'qualified',
      lastContact: '2024-03-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      company: 'XYZ Inc',
      email: 'jane@xyz.com',
      phone: '+1 234 567 891',
      status: 'contacted',
      lastContact: '2024-03-14'
    }
  ];

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = {
      new: { color: 'gray', label: 'New' },
      contacted: { color: 'blue', label: 'Contacted' },
      qualified: { color: 'green', label: 'Qualified' },
      proposal: { color: 'yellow', label: 'Proposal' },
      negotiation: { color: 'purple', label: 'Negotiation' },
      closed: { color: 'red', label: 'Closed' }
    };

    const config = statusConfig[status];
    return (
      <Badge color={config.color as any} size="sm">
        {config.label}
      </Badge>
    );
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button
            size="xs"
            variant="secondary"
            icon={FiMenu}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          <Title>Mobile CRM</Title>
          <Button size="xs" variant="secondary" icon={FiPlus} />
        </div>
        <div className="p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50">
          <div className="w-64 h-full bg-white">
            <div className="p-4">
              <Title>Menu</Title>
              <List className="mt-4">
                <ListItem>Dashboard</ListItem>
                <ListItem>Leads</ListItem>
                <ListItem>Deals</ListItem>
                <ListItem>Tasks</ListItem>
                <ListItem>Calendar</ListItem>
                <ListItem>Reports</ListItem>
              </List>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {selectedLead ? (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Title>{selectedLead.name}</Title>
              {getStatusBadge(selectedLead.status)}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FiUser className="w-5 h-5 text-gray-400" />
                <Text>{selectedLead.company}</Text>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-5 h-5 text-gray-400" />
                <Text>{selectedLead.email}</Text>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-5 h-5 text-gray-400" />
                <Text>{selectedLead.phone}</Text>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                <Text>Last Contact: {new Date(selectedLead.lastContact).toLocaleDateString()}</Text>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="xs" variant="secondary">
                Edit
              </Button>
              <Button size="xs" variant="secondary">
                Call
              </Button>
              <Button size="xs" variant="secondary">
                Email
              </Button>
            </div>
          </Card>
        ) : (
          <List>
            {filteredLeads.map(lead => (
              <ListItem
                key={lead.id}
                className="py-4"
                onClick={() => setSelectedLead(lead)}
              >
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Title>{lead.name}</Title>
                      <Text className="text-gray-500">{lead.company}</Text>
                      <div className="flex items-center gap-2 mt-2">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <Text className="text-sm">{lead.email}</Text>
                      </div>
                    </div>
                    {getStatusBadge(lead.status)}
                  </div>
                </Card>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    </div>
  );
};

export default MobileCRM; 