import { create } from 'zustand';
import { Lead, CRMIntegration, AutomationRule } from '../types/leadScoring';

interface LeadScoringState {
  leads: Lead[];
  integrations: CRMIntegration[];
  automationRules: AutomationRule[];
  selectedLead: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  
  setIntegrations: (integrations: CRMIntegration[]) => void;
  addIntegration: (integration: CRMIntegration) => void;
  updateIntegration: (integrationId: string, updates: Partial<CRMIntegration>) => void;
  deleteIntegration: (integrationId: string) => void;
  
  setAutomationRules: (rules: AutomationRule[]) => void;
  addAutomationRule: (rule: AutomationRule) => void;
  updateAutomationRule: (ruleId: string, updates: Partial<AutomationRule>) => void;
  deleteAutomationRule: (ruleId: string) => void;
  
  setSelectedLead: (leadId: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLeadScoringStore = create<LeadScoringState>((set) => ({
  leads: [],
  integrations: [],
  automationRules: [],
  selectedLead: null,
  isLoading: false,
  error: null,

  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
  updateLead: (leadId, updates) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, ...updates } : lead
      ),
    })),
  deleteLead: (leadId) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== leadId),
    })),

  setIntegrations: (integrations) => set({ integrations }),
  addIntegration: (integration) =>
    set((state) => ({ integrations: [...state.integrations, integration] })),
  updateIntegration: (integrationId, updates) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === integrationId
          ? { ...integration, ...updates }
          : integration
      ),
    })),
  deleteIntegration: (integrationId) =>
    set((state) => ({
      integrations: state.integrations.filter(
        (integration) => integration.id !== integrationId
      ),
    })),

  setAutomationRules: (rules) => set({ automationRules: rules }),
  addAutomationRule: (rule) =>
    set((state) => ({ automationRules: [...state.automationRules, rule] })),
  updateAutomationRule: (ruleId, updates) =>
    set((state) => ({
      automationRules: state.automationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ),
    })),
  deleteAutomationRule: (ruleId) =>
    set((state) => ({
      automationRules: state.automationRules.filter(
        (rule) => rule.id !== ruleId
      ),
    })),

  setSelectedLead: (leadId) => set({ selectedLead: leadId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 