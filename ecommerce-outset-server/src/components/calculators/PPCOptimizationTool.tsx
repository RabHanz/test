import React from 'react';
import {
  TextField,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { BaseCalculator } from './BaseCalculator';

interface PPCOptimizationToolProps {
  onLeadCapture?: (email: string, name: string) => Promise<void>;
}

export const PPCOptimizationTool: React.FC<PPCOptimizationToolProps> = ({
  onLeadCapture,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [score, setScore] = React.useState<number>();
  const [formData, setFormData] = React.useState({
    campaignType: '',
    dailyBudget: '',
    acos: '',
    conversionRate: '',
    cpc: '',
    impressions: '',
    clicks: '',
    sales: '',
    targeting: {
      broad: false,
      phrase: false,
      exact: false,
    },
    matchTypes: {
      auto: false,
      manual: false,
    },
    optimization: {
      bidAdjustments: false,
      negativeKeywords: false,
      searchTermAnalysis: false,
    },
  });

  const steps = [
    {
      label: 'Campaign Overview',
      description: 'Enter your campaign metrics and budget information.',
    },
    {
      label: 'Performance Metrics',
      description: 'Input your current campaign performance data.',
    },
    {
      label: 'Optimization Settings',
      description: 'Configure your targeting and optimization preferences.',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTargetingChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      targeting: {
        ...prev.targeting,
        [type]: !prev.targeting[type as keyof typeof prev.targeting],
      },
    }));
  };

  const handleMatchTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      matchTypes: {
        ...prev.matchTypes,
        [type]: !prev.matchTypes[type as keyof typeof prev.matchTypes],
      },
    }));
  };

  const handleOptimizationChange = (setting: string) => {
    setFormData((prev) => ({
      ...prev,
      optimization: {
        ...prev.optimization,
        [setting]: !prev.optimization[setting as keyof typeof prev.optimization],
      },
    }));
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    const {
      acos,
      conversionRate,
      cpc,
      impressions,
      clicks,
      sales,
      targeting,
      matchTypes,
      optimization,
    } = formData;

    // ACOS score (0-20 points)
    const acosValue = parseFloat(acos);
    if (acosValue < 15) {
      calculatedScore += 20;
    } else if (acosValue < 25) {
      calculatedScore += 15;
    } else if (acosValue < 35) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Conversion rate score (0-20 points)
    const convRate = parseFloat(conversionRate);
    if (convRate > 20) {
      calculatedScore += 20;
    } else if (convRate > 15) {
      calculatedScore += 15;
    } else if (convRate > 10) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // CPC efficiency score (0-20 points)
    const cpcValue = parseFloat(cpc);
    const salesValue = parseFloat(sales);
    const clicksValue = parseFloat(clicks);
    const cpcEfficiency = (salesValue / clicksValue) / cpcValue;
    if (cpcEfficiency > 3) {
      calculatedScore += 20;
    } else if (cpcEfficiency > 2) {
      calculatedScore += 15;
    } else if (cpcEfficiency > 1) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Targeting strategy score (0-20 points)
    const targetingScore = Object.values(targeting).filter(Boolean).length * 6.67;
    calculatedScore += targetingScore;

    // Match type optimization score (0-10 points)
    const matchTypeScore = Object.values(matchTypes).filter(Boolean).length * 5;
    calculatedScore += matchTypeScore;

    // Optimization settings score (0-10 points)
    const optimizationScore = Object.values(optimization).filter(Boolean).length * 3.33;
    calculatedScore += optimizationScore;

    setScore(Math.round(calculatedScore));
    setIsComplete(true);
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      calculateScore();
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsComplete(false);
    setScore(undefined);
    setFormData({
      campaignType: '',
      dailyBudget: '',
      acos: '',
      conversionRate: '',
      cpc: '',
      impressions: '',
      clicks: '',
      sales: '',
      targeting: {
        broad: false,
        phrase: false,
        exact: false,
      },
      matchTypes: {
        auto: false,
        manual: false,
      },
      optimization: {
        bidAdjustments: false,
        negativeKeywords: false,
        searchTermAnalysis: false,
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Campaign Type</InputLabel>
                <Select
                  value={formData.campaignType}
                  onChange={(e) => handleInputChange('campaignType', e.target.value)}
                  label="Campaign Type"
                >
                  <MenuItem value="sponsored_products">Sponsored Products</MenuItem>
                  <MenuItem value="sponsored_brands">Sponsored Brands</MenuItem>
                  <MenuItem value="sponsored_display">Sponsored Display</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Daily Budget ($)"
                type="number"
                value={formData.dailyBudget}
                onChange={(e) => handleInputChange('dailyBudget', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ACOS (%)"
                type="number"
                value={formData.acos}
                onChange={(e) => handleInputChange('acos', e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Conversion Rate (%)"
                type="number"
                value={formData.conversionRate}
                onChange={(e) => handleInputChange('conversionRate', e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPC ($)"
                type="number"
                value={formData.cpc}
                onChange={(e) => handleInputChange('cpc', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Impressions"
                type="number"
                value={formData.impressions}
                onChange={(e) => handleInputChange('impressions', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Clicks"
                type="number"
                value={formData.clicks}
                onChange={(e) => handleInputChange('clicks', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Sales ($)"
                type="number"
                value={formData.sales}
                onChange={(e) => handleInputChange('sales', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Targeting Strategy
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.targeting.broad}
                      onChange={() => handleTargetingChange('broad')}
                    />
                  }
                  label="Broad Match"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.targeting.phrase}
                      onChange={() => handleTargetingChange('phrase')}
                    />
                  }
                  label="Phrase Match"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.targeting.exact}
                      onChange={() => handleTargetingChange('exact')}
                    />
                  }
                  label="Exact Match"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Match Types
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.matchTypes.auto}
                      onChange={() => handleMatchTypeChange('auto')}
                    />
                  }
                  label="Auto Campaigns"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.matchTypes.manual}
                      onChange={() => handleMatchTypeChange('manual')}
                    />
                  }
                  label="Manual Campaigns"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Optimization Settings
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.optimization.bidAdjustments}
                      onChange={() => handleOptimizationChange('bidAdjustments')}
                    />
                  }
                  label="Bid Adjustments"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.optimization.negativeKeywords}
                      onChange={() => handleOptimizationChange('negativeKeywords')}
                    />
                  }
                  label="Negative Keywords"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.optimization.searchTermAnalysis}
                      onChange={() => handleOptimizationChange('searchTermAnalysis')}
                    />
                  }
                  label="Search Term Analysis"
                />
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <BaseCalculator
      title="PPC Optimization Tool"
      description="Optimize your Amazon PPC campaigns with data-driven insights. Get recommendations for improving performance and reducing ACOS."
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onReset={handleReset}
      isComplete={isComplete}
      score={score}
      personaType="GROWTH"
      onLeadCapture={onLeadCapture}
    >
      {renderStepContent()}
    </BaseCalculator>
  );
}; 