
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useIntegrationsStore from '../../store/integrationsStore';
import { ServerStackIcon, BarChartIcon, LinkIcon, MailIcon, CogIcon, DocumentTextIcon, ShieldCheckIcon } from '../icons';
import SectionWrapper from '../dashboard/shared/SectionWrapper'; // Re-use for consistent styling
import Button from '../Button';

// Lazy load tab content
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const LeadScoringTab = React.lazy(() => import('./tabs/LeadScoringTab'));
const CrmIntegrationTab = React.lazy(() => import('./tabs/CrmIntegrationTab'));
const EmailIntegrationTab = React.lazy(() => import('./tabs/EmailIntegrationTab'));
const AutomationRulesTab = React.lazy(() => import('./tabs/AutomationRulesTab'));
const ReportingTab = React.lazy(() => import('./tabs/ReportingTab'));


const TABS = [
  { id: 'overview', label: 'Overview', Icon: BarChartIcon, component: OverviewTab },
  { id: 'leadScoring', label: 'Lead Scoring', Icon: ShieldCheckIcon, component: LeadScoringTab },
  { id: 'crm', label: 'CRM (HubSpot)', Icon: LinkIcon, component: CrmIntegrationTab },
  { id: 'email', label: 'Email (Mailchimp)', Icon: MailIcon, component: EmailIntegrationTab },
  { id: 'automation', label: 'Automation Rules', Icon: CogIcon, component: AutomationRulesTab },
  { id: 'reporting', label: 'Reporting', Icon: DocumentTextIcon, component: ReportingTab },
];

const IntegrationsDashboardPage: React.FC = () => {
  const { activeTab, setActiveTab, isLoading } = useIntegrationsStore();

  useEffect(() => {
    document.title = "Integrations Dashboard - Ecommerce Outset";
    // Potentially fetch initial data or check statuses here
  }, []);

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 lg:p-8 pt-20 md:pt-24"
    >
      <div className="container mx-auto">
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <ServerStackIcon className="w-10 h-10 text-orange-400 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Integrations Dashboard</h1>
          </div>
          {/* Global actions like "Refresh All Statuses" could go here */}
        </header>

        <div className="mb-6 md:mb-8 overflow-x-auto custom-scrollbar">
          <nav className="flex space-x-1 border-b border-gray-700" aria-label="Integrations sections navigation">
            {TABS.map((tab) => (
              <button
                type