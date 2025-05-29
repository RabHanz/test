
import React from 'react';
import SectionWrapper from '../../dashboard/shared/SectionWrapper';
import FinancialToolStub from './shared/FinancialToolStub';
import { INVEST_ANALYTICAL_TOOLS } from '../../../constants';
import { trackInvestHubEvent } from '../../../utils/trackingUtils';
import { CalculatorIcon, ChartPieIcon, ShieldCheckIcon, CheckCircleIcon, BarChartIcon } from '../../icons'; // Added CheckCircleIcon, BarChartIcon
import type { InvestAnalyticalTool } from '../../../types';

const InvestAnalyticalToolsSection: React.FC = () => {
  const getIconForToolType = (toolType: InvestAnalyticalTool['toolType']) => {
    switch (toolType) {
      case 'Calculator': return CalculatorIcon;
      case 'Optimizer': return ChartPieIcon;
      case 'Risk Matrix': return ShieldCheckIcon;
      case 'Checklist': return CheckCircleIcon; 
      case 'Dashboard': return BarChartIcon; 
      default: return CalculatorIcon;
    }
  };
  
  return (
    <SectionWrapper 
      title="Powerful Analytical Tools for Investors" 
      className="bg-gray-850 py-12 md:py-16" 
      actions={<CalculatorIcon className="w-6 h-6 text-yellow-400"/>}
    >
      <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
        Leverage our suite of sophisticated tools for scenario modeling, portfolio optimization, risk assessment, and performance tracking. (Note: Advanced tools may require data input or integration).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {INVEST_ANALYTICAL_TOOLS.map(tool => (
          <FinancialToolStub
            key={tool.id}
            title={tool.name}
            description={`${tool.toolType}: ${tool.description}`}
            ctaText="Launch Tool"
            onCtaClick={() => {
              trackInvestHubEvent('invest_analytical_tool_clicked', { tool_id: tool.id, tool_name: tool.name });
              alert(`Placeholder: Open ${tool.name}.`);
            }}
            icon={getIconForToolType(tool.toolType)}
            accentColorClass="yellow"
            className="!bg-gray-800 border !border-yellow-600/50 hover:shadow-yellow-500/20"
          />
        ))}
      </div>
       <p className="text-xs text-gray-500 mt-8 text-center">
        Integrations with financial analysis platforms and automated market data feeds are planned for premium tiers.
      </p>
    </SectionWrapper>
  );
};

export default InvestAnalyticalToolsSection;
