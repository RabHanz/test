
import React from 'react';
import type { ClientOnboardingStep } from '../../../types';
import ChecklistItemClient, { ChecklistItemClientProps } from '../shared/ChecklistItemClient';

interface OnboardingChecklistProps {
  steps: ClientOnboardingStep[];
  onToggleStep: (stepId: string, subStepId?: string) => void;
  accentColorClass?: string;
}

const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ steps, onToggleStep, accentColorClass }) => {
  if (!steps || steps.length === 0) {
    return <p className="text-gray-400">No onboarding steps defined yet.</p>;
  }

  const mapStepsToClientProps = (currentSteps: ClientOnboardingStep[], parentId?: string): ChecklistItemClientProps[] => {
    return currentSteps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      isCompleted: step.isCompleted,
      onToggle: parentId ? () => onToggleStep(parentId, step.id) : () => onToggleStep(step.id),
      estimatedTime: step.estimatedTime,
      relatedAction: step.relatedAction,
      accentColorClass: accentColorClass,
      subSteps: step.subSteps ? mapStepsToClientProps(step.subSteps, step.id) : undefined,
    }));
  };

  const checklistItems: ChecklistItemClientProps[] = mapStepsToClientProps(steps);

  return (
    <div className="space-y-1">
      {checklistItems.map(itemProps => (
        <ChecklistItemClient
          key={itemProps.id}
          {...itemProps}
        />
      ))}
    </div>
  );
};

export default OnboardingChecklist;
