import { useEffect } from 'react';
import { useLeadScoringStore } from '../store/leadScoringStore';
import {
  getLeads,
  getIntegrations,
  getAutomationRules,
  createLead,
  updateLead,
  deleteLead,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
} from '../services/leadScoringService';

export const useLeadScoring = () => {
  const {
    leads,
    integrations,
    automationRules,
    selectedLead,
    isLoading,
    error,
    setLeads,
    setIntegrations,
    setAutomationRules,
    setSelectedLead,
    setLoading,
    setError,
  } = useLeadScoringStore();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsData, integrationsData, rulesData] = await Promise.all([
          getLeads(),
          getIntegrations(),
          getAutomationRules(),
        ]);
        setLeads(leadsData);
        setIntegrations(integrationsData);
        setAutomationRules(rulesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLeads, setIntegrations, setAutomationRules, setLoading, setError]);

  // Lead management functions
  const handleCreateLead = async (leadData: Omit<typeof leads[0], 'id'>) => {
    try {
      setLoading(true);
      const newLead = await createLead(leadData);
      setLeads([...leads, newLead]);
      return newLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<typeof leads[0]>) => {
    try {
      setLoading(true);
      const updatedLead = await updateLead(leadId, updates);
      setLeads(leads.map((lead) => (lead.id === leadId ? updatedLead : lead)));
      return updatedLead;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      setLoading(true);
      await deleteLead(leadId);
      setLeads(leads.filter((lead) => lead.id !== leadId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Integration management functions
  const handleCreateIntegration = async (integrationData: Omit<typeof integrations[0], 'id'>) => {
    try {
      setLoading(true);
      const newIntegration = await createIntegration(integrationData);
      setIntegrations([...integrations, newIntegration]);
      return newIntegration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create integration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIntegration = async (
    integrationId: string,
    updates: Partial<typeof integrations[0]>
  ) => {
    try {
      setLoading(true);
      const updatedIntegration = await updateIntegration(integrationId, updates);
      setIntegrations(
        integrations.map((integration) =>
          integration.id === integrationId ? updatedIntegration : integration
        )
      );
      return updatedIntegration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update integration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      setLoading(true);
      await deleteIntegration(integrationId);
      setIntegrations(integrations.filter((integration) => integration.id !== integrationId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete integration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Automation rule management functions
  const handleCreateAutomationRule = async (ruleData: Omit<typeof automationRules[0], 'id'>) => {
    try {
      setLoading(true);
      const newRule = await createAutomationRule(ruleData);
      setAutomationRules([...automationRules, newRule]);
      return newRule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAutomationRule = async (
    ruleId: string,
    updates: Partial<typeof automationRules[0]>
  ) => {
    try {
      setLoading(true);
      const updatedRule = await updateAutomationRule(ruleId, updates);
      setAutomationRules(
        automationRules.map((rule) => (rule.id === ruleId ? updatedRule : rule))
      );
      return updatedRule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update automation rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAutomationRule = async (ruleId: string) => {
    try {
      setLoading(true);
      await deleteAutomationRule(ruleId);
      setAutomationRules(automationRules.filter((rule) => rule.id !== ruleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete automation rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    leads,
    integrations,
    automationRules,
    selectedLead,
    isLoading,
    error,

    // Lead actions
    createLead: handleCreateLead,
    updateLead: handleUpdateLead,
    deleteLead: handleDeleteLead,
    setSelectedLead,

    // Integration actions
    createIntegration: handleCreateIntegration,
    updateIntegration: handleUpdateIntegration,
    deleteIntegration: handleDeleteIntegration,

    // Automation rule actions
    createAutomationRule: handleCreateAutomationRule,
    updateAutomationRule: handleUpdateAutomationRule,
    deleteAutomationRule: handleDeleteAutomationRule,
  };
}; 