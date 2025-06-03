import { create } from 'zustand';
import type { Lead, LeadScore, LeadStage } from '../types/leadScoring';

interface LeadScoringState {
  leads: Lead[];
  scores: LeadScore[];
  stages: LeadStage[];
  setLeads: (leads: Lead[]) => void;
  setScores: (scores: LeadScore[]) => void;
  setStages: (stages: LeadStage[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  removeLead: (leadId: string) => void;
  updateScore: (leadId: string, score: number) => void;
  updateStage: (leadId: string, stage: LeadStage) => void;
}

export const useLeadScoringStore = create<LeadScoringState>((set) => ({
  leads: [],
  scores: [],
  stages: [],
  setLeads: (leads) => set({ leads }),
  setScores: (scores) => set({ scores }),
  setStages: (stages) => set({ stages }),
  addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),
  updateLead: (lead) =>
    set((state) => ({
      leads: state.leads.map((l) => (l.id === lead.id ? lead : l))
    })),
  removeLead: (leadId) =>
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== leadId)
    })),
  updateScore: (leadId, score) =>
    set((state) => ({
      scores: state.scores.map((s) =>
        s.leadId === leadId ? { ...s, score } : s
      )
    })),
  updateStage: (leadId, stage) =>
    set((state) => ({
      stages: state.stages.map((s) =>
        s.leadId === leadId ? { ...s, stage } : s
      )
    }))
})); 