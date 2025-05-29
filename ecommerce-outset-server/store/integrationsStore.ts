
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IntegrationsDashboardState, CRMFieldMapping, EmailListSegmentationRule, AutomationRule, IntegrationLogEntry } from '../types';
import { trackIntegrationsDashboardEvent } from '../utils/trackingUtils';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.1';


const initialCRMFieldMappings: CRMFieldMapping[] = [
  { eoField: 'visitorStore.email', crmField: 'hubspot.contact.email', direction: 'to_crm', isEnabled: true },
  { eoField: 'visitorStore.determinedPersonaId', crmField: 'hubspot.contact.persona', direction: 'to_crm', isEnabled: true },
  { eoField: 'visitorStore.leadScore.totalScore', crmField: 'hubspot.contact.lead_score', direction: 'to_crm', isEnabled: true },
  { eoField: 'visitorStore.leadStage', crmField: 'hubspot.contact.lifecyclestage', direction: 'to_crm', isEnabled: false },
];

const initialEmailListRules: EmailListSegmentationRule[] = [
    { id: uuidv4(), name: 'Hot Launch Leads', personaId: 'launch', minLeadScore: 60, emailListName: 'EO Hot Launch Prospects', isEnabled: true},
    { id: uuidv4(), name: 'Engaged Scaling Sarahs', personaId: 'scale', minLeadScore: 50, emailListName: 'EO Engaged Scalers', isEnabled: true},
];

const initialAutomationRules: AutomationRule[] = [
    { 
        id: uuidv4(), 
        name: 'Notify Sales for High Score Launch Persona',
        description: 'When a "Launch" persona reaches a lead score of 75, notify the sales team.',
        trigger: { type: 'lead_score_reaches', condition: { personaId: 'launch', score: 75 } },
        actions: [
            { type: 'send_notification', params: { channel: 'sales_slack', message: 'New hot Launch lead: [LeadEmail]!' } },
            { type: 'assign_team_member', params: { teamMemberId: 'sales_member_1' } }
        ],
        isEnabled: true
    }
];

const useIntegrationsStore = create<IntegrationsDashboardState>()(
  persist(
    (set, get) => ({
      activeTab: 'overview',
      // HubSpot
      hubspotApiKey: '',
      isHubspotConnected: false,
      hubspotFieldMappings: initialCRMFieldMappings,
      hubspotLastSync: null,
      hubspotSyncStatus: 'idle',
      // Mailchimp
      mailchimpApiKey: '',
      isMailchimpConnected: false,
      mailchimpListRules: initialEmailListRules,
      mailchimpLastSync: null,
      mailchimpSyncStatus: 'idle',
      // Automation
      automationRules: initialAutomationRules,
      // General
      integrationLogs: [],
      isLoading: false,

      setActiveTab: (tabId) => {
        set({ activeTab: tabId });
        trackIntegrationsDashboardEvent('tab_changed', { tab_id: tabId });
      },

      setHubspotApiKey: (key) => set({ hubspotApiKey: key }),
      toggleHubspotConnection: () => {
        const currentlyConnected = get().isHubspotConnected;
        const newStatus = !currentlyConnected;
        set({ isHubspotConnected: newStatus, hubspotSyncStatus: 'idle' });
        get().addLogEntry({ platform: 'HubSpot', type: 'connection_status', message: `Connection ${newStatus ? 'established' : 'terminated'}.`});
        trackIntegrationsDashboardEvent(newStatus ? 'crm_connect_attempt' : 'crm_disconnect_attempt', { crm: 'HubSpot', status: newStatus });
      },
      updateHubspotFieldMapping: (updatedMapping) => {
        set(state => ({
          hubspotFieldMappings: state.hubspotFieldMappings.map(m => m.eoField === updatedMapping.eoField ? updatedMapping : m)
        }));
        trackIntegrationsDashboardEvent('crm_field_mapping_updated', { crm: 'HubSpot', field: updatedMapping.eoField });
      },
      triggerHubspotSync: () => {
        if (!get().isHubspotConnected) {
          get().addLogEntry({ platform: 'HubSpot', type: 'error', message: 'Sync failed: Not connected.'});
          return;
        }
        set({ hubspotSyncStatus: 'syncing', isLoading: true });
        get().addLogEntry({ platform: 'HubSpot', type: 'sync', message: 'Sync started...'});
        trackIntegrationsDashboardEvent('crm_sync_triggered', { crm: 'HubSpot' });
        setTimeout(() => { // Simulate sync
          const success = Math.random() > 0.2; // 80% success rate
          set({ hubspotSyncStatus: success ? 'success' : 'error', hubspotLastSync: new Date(), isLoading: false });
          get().addLogEntry({ platform: 'HubSpot', type: success ? 'sync' : 'error', message: `Sync ${success ? 'completed successfully' : 'failed'}.`});
        }, 2000);
      },

      setMailchimpApiKey: (key) => set({ mailchimpApiKey: key }),
      toggleMailchimpConnection: () => {
        const currentlyConnected = get().isMailchimpConnected;
        const newStatus = !currentlyConnected;
        set({ isMailchimpConnected: newStatus, mailchimpSyncStatus: 'idle' });
        get().addLogEntry({ platform: 'Mailchimp', type: 'connection_status', message: `Connection ${newStatus ? 'established' : 'terminated'}.`});
        trackIntegrationsDashboardEvent(newStatus ? 'email_connect_attempt' : 'email_disconnect_attempt', { platform: 'Mailchimp', status: newStatus });
      },
      updateMailchimpListRule: (updatedRule) => {
        set(state => ({
          mailchimpListRules: state.mailchimpListRules.map(r => r.id === updatedRule.id ? updatedRule : r)
        }));
        trackIntegrationsDashboardEvent('email_rule_updated', { platform: 'Mailchimp', rule_id: updatedRule.id });
      },
       triggerMailchimpSync: () => {
        if (!get().isMailchimpConnected) {
            get().addLogEntry({ platform: 'Mailchimp', type: 'error', message: 'Sync failed: Not connected.'});
            return;
        }
        set({ mailchimpSyncStatus: 'syncing', isLoading: true });
        get().addLogEntry({ platform: 'Mailchimp', type: 'sync', message: 'Sync started...'});
        trackIntegrationsDashboardEvent('email_sync_triggered', { platform: 'Mailchimp' });
        setTimeout(() => { // Simulate sync
          const success = Math.random() > 0.2;
          set({ mailchimpSyncStatus: success ? 'success' : 'error', mailchimpLastSync: new Date(), isLoading: false });
           get().addLogEntry({ platform: 'Mailchimp', type: success ? 'sync' : 'error', message: `Sync ${success ? 'completed successfully' : 'failed'}.`});
        }, 2000);
      },

      addAutomationRule: (rule) => {
        const newRule = { ...rule, id: uuidv4() };
        set(state => ({ automationRules: [...state.automationRules, newRule] }));
        trackIntegrationsDashboardEvent('automation_rule_created', { rule_id: newRule.id });
      },
      updateAutomationRule: (updatedRule) => {
        set(state => ({
          automationRules: state.automationRules.map(r => r.id === updatedRule.id ? updatedRule : r)
        }));
        trackIntegrationsDashboardEvent('automation_rule_updated', { rule_id: updatedRule.id });
      },
      deleteAutomationRule: (ruleId) => {
        set(state => ({
          automationRules: state.automationRules.filter(r => r.id !== ruleId)
        }));
        trackIntegrationsDashboardEvent('automation_rule_deleted', { rule_id: ruleId });
      },
      
      addLogEntry: (log) => {
        const newLog: IntegrationLogEntry = { ...log, timestamp: Date.now() };
        set(state => ({ integrationLogs: [newLog, ...state.integrationLogs].slice(0, 100) })); // Keep last 100 logs
      },

      _loadIntegrationsState: (persistedState) => {
        const loadedState = {
          ...persistedState,
          hubspotFieldMappings: persistedState.hubspotFieldMappings || initialCRMFieldMappings,
          mailchimpListRules: persistedState.mailchimpListRules || initialEmailListRules,
          automationRules: persistedState.automationRules || initialAutomationRules,
          integrationLogs: Array.isArray(persistedState.integrationLogs) ? persistedState.integrationLogs : [],
        };
        set(loadedState);
      }
    }),
    {
      name: 'integrations-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          state._loadIntegrationsState(state);
          console.log("Integrations Dashboard state rehydrated");
        }
        if (error) {
          console.error("Failed to rehydrate Integrations Dashboard state:", error);
        }
      },
    }
  )
);

export default useIntegrationsStore;
