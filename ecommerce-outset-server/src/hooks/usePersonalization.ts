import { useContext } from 'react';
import { PersonalizationContext } from '../context/PersonalizationContext';
import { UserContext, InteractionType } from '../types/personalization';

export function usePersonalization() {
  const context = useContext(PersonalizationContext);

  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }

  const updateUserContext = (newContext: Partial<UserContext>) => {
    context.updateContext(newContext);
  };

  const trackUserInteraction = (
    interactionType: InteractionType,
    metadata?: Record<string, any>
  ) => {
    context.trackInteraction(interactionType, metadata);
  };

  const getPersonalizedContent = (contentId: string) => {
    return context.recommendations.content.find(
      (content) => content.id === contentId
    );
  };

  const getPersonalizedServices = () => {
    return context.recommendations.services;
  };

  const getPersonalizedProducts = () => {
    return context.recommendations.products;
  };

  const getPersonalizedPromotions = () => {
    return context.recommendations.promotions;
  };

  const getPersonalizedUI = () => {
    return context.actions.ui;
  };

  const getPersonalizedNotifications = () => {
    return context.actions.notifications;
  };

  return {
    context: context.context,
    recommendations: context.recommendations,
    actions: context.actions,
    updateUserContext,
    trackUserInteraction,
    getPersonalizedContent,
    getPersonalizedServices,
    getPersonalizedProducts,
    getPersonalizedPromotions,
    getPersonalizedUI,
    getPersonalizedNotifications,
  };
} 