import React, { useEffect, useState } from 'react';
import { Lead } from '../../types/lead';
import { LeadService } from '../../services/lead';
import { useUserStore } from '../../store/userStore';
import { LEAD_SCORING_POINTS, LEAD_STAGE_THRESHOLDS } from '../../constants';

interface LeadScoringDashboardProps {
  showDetails?: boolean;
  onLeadClick?: (lead: Lead) => void;
}

export const LeadScoringDashboard: React.FC<LeadScoringDashboardProps> = ({
  showDetails = true,
  onLeadClick
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const service = new LeadService();
        const fetchedLeads = await service.getLeadsWithScores({
          userId: user.id,
          includeDetails: showDetails
        });
        setLeads(fetchedLeads);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leads');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [user, showDetails]);

  const getLeadStage = (score: number): string => {
    if (score >= LEAD_STAGE_THRESHOLDS.HOT) return 'Hot';
    if (score >= LEAD_STAGE_THRESHOLDS.WARM) return 'Warm';
    if (score >= LEAD_STAGE_THRESHOLDS.COLD) return 'Cold';
    return 'New';
  };

  const getStageColor = (stage: string): string => {
    switch (stage.toLowerCase()) {
      case 'hot':
        return 'text-red-500';
      case 'warm':
        return 'text-orange-500';
      case 'cold':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return <div className="leads-loading">Loading leads...</div>;
  }

  if (error) {
    return <div className="leads-error">Error: {error}</div>;
  }

  if (leads.length === 0) {
    return <div className="leads-empty">No leads to display</div>;
  }

  return (
    <div className="lead-scoring-dashboard">
      <h2 className="dashboard-title">Lead Scoring Dashboard</h2>
      <div className="leads-grid">
        {leads.map(lead => {
          const stage = getLeadStage(lead.score);
          const stageColor = getStageColor(stage);

          return (
            <div
              key={lead.id}
              className="lead-card"
              onClick={() => onLeadClick?.(lead)}
            >
              <div className="lead-header">
                <h3 className="lead-name">{lead.name}</h3>
                <span className={`lead-stage ${stageColor}`}>
                  {stage}
                </span>
              </div>
              <div className="lead-score">
                <span className="score-value">{lead.score}</span>
                <span className="score-label">points</span>
              </div>
              {showDetails && (
                <div className="lead-details">
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{lead.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Company:</span>
                    <span className="detail-value">{lead.company}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Activity:</span>
                    <span className="detail-value">
                      {new Date(lead.lastActivity).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="lead-actions">
                <button className="action-button view">View Details</button>
                <button className="action-button contact">Contact</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 