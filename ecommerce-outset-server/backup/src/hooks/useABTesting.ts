import { useState, useEffect } from 'react';
import { getActiveTests, trackTestImpression, trackTestConversion } from '../services/testingService';
import { ABTest, PersonaType } from '../types/testing';

interface UseABTestingOptions {
  personaType?: PersonaType;
  testId?: string;
}

export const useABTesting = ({ personaType, testId }: UseABTestingOptions = {}) => {
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const tests = await getActiveTests();
        const filteredTests = testId
          ? tests.filter(test => test.id === testId)
          : tests;

        // Filter tests by persona type if provided
        const personaTests = personaType
          ? filteredTests.filter(test => !test.personaType || test.personaType === personaType)
          : filteredTests;

        setActiveTests(personaTests);

        // Select variants for each test
        const variants: Record<string, string> = {};
        personaTests.forEach(test => {
          const variant = selectVariant(test);
          variants[test.id] = variant.id;
          trackTestImpression(test.id, variant.id);
        });

        setSelectedVariants(variants);
      } catch (error) {
        console.error('Error loading A/B tests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, [testId, personaType]);

  const getVariant = (testId: string) => {
    const test = activeTests.find(t => t.id === testId);
    if (!test) return null;

    const variantId = selectedVariants[testId];
    return test.variants.find(v => v.id === variantId)?.config || null;
  };

  const trackConversion = async (testId: string) => {
    const variantId = selectedVariants[testId];
    if (variantId) {
      await trackTestConversion(testId, variantId);
    }
  };

  return {
    loading,
    activeTests,
    getVariant,
    trackConversion,
  };
};

function selectVariant(test: ABTest) {
  // Check if user already has a variant assigned
  const storedVariant = localStorage.getItem(`ab_test_${test.id}`);
  if (storedVariant) {
    const variant = test.variants.find(v => v.id === storedVariant);
    if (variant) return variant;
  }

  // Select variant based on weights
  const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const variant of test.variants) {
    random -= variant.weight;
    if (random <= 0) {
      // Store selected variant
      localStorage.setItem(`ab_test_${test.id}`, variant.id);
      return variant;
    }
  }

  // Fallback to first variant
  return test.variants[0];
} 