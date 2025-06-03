import React, { useEffect } from 'react';
import { useABTesting } from '../../hooks/useABTesting';
import { PersonaType } from '../../types/testing';

interface ABTestVariantProps {
  testId: string;
  personaType?: PersonaType;
  children: (config: any) => React.ReactNode;
  onConversion?: () => void;
}

const ABTestVariant: React.FC<ABTestVariantProps> = ({
  testId,
  personaType,
  children,
  onConversion,
}) => {
  const { loading, getVariant, trackConversion } = useABTesting({
    testId,
    personaType,
  });

  useEffect(() => {
    if (!loading && onConversion) {
      trackConversion(testId).then(() => {
        onConversion();
      });
    }
  }, [loading, testId, onConversion, trackConversion]);

  if (loading) {
    return null;
  }

  const variantConfig = getVariant(testId);
  if (!variantConfig) {
    return null;
  }

  return <>{children(variantConfig)}</>;
};

export default ABTestVariant; 