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
  Checkbox,
} from '@mui/material';
import { BaseCalculator } from './BaseCalculator';

interface ProductResearchValidatorProps {
  onLeadCapture?: (email: string, name: string) => Promise<void>;
}

export const ProductResearchValidator: React.FC<ProductResearchValidatorProps> = ({
  onLeadCapture,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [score, setScore] = React.useState<number>();
  const [formData, setFormData] = React.useState({
    productName: '',
    category: '',
    competitionLevel: 50,
    searchVolume: '',
    averagePrice: '',
    profitMargin: '',
    seasonality: '',
    trends: {
      growing: false,
      stable: false,
      declining: false,
    },
    barriers: {
      high: false,
      medium: false,
      low: false,
    },
    requirements: {
      certification: false,
      specialHandling: false,
      restricted: false,
    },
  });

  const steps = [
    {
      label: 'Product Overview',
      description: 'Enter basic product information and market data.',
    },
    {
      label: 'Market Analysis',
      description: 'Evaluate competition and market trends.',
    },
    {
      label: 'Requirements & Barriers',
      description: 'Assess entry requirements and potential barriers.',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTrendChange = (trend: string) => {
    setFormData((prev) => ({
      ...prev,
      trends: {
        ...prev.trends,
        [trend]: !prev.trends[trend as keyof typeof prev.trends],
      },
    }));
  };

  const handleBarrierChange = (barrier: string) => {
    setFormData((prev) => ({
      ...prev,
      barriers: {
        ...prev.barriers,
        [barrier]: !prev.barriers[barrier as keyof typeof prev.barriers],
      },
    }));
  };

  const handleRequirementChange = (requirement: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [requirement]: !prev.requirements[requirement as keyof typeof prev.requirements],
      },
    }));
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    const {
      competitionLevel,
      searchVolume,
      averagePrice,
      profitMargin,
      trends,
      barriers,
      requirements,
    } = formData;

    // Competition score (0-20 points)
    calculatedScore += (100 - competitionLevel) * 0.2;

    // Search volume score (0-20 points)
    const volume = parseFloat(searchVolume);
    if (volume > 10000) {
      calculatedScore += 20;
    } else if (volume > 5000) {
      calculatedScore += 15;
    } else if (volume > 1000) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Profit margin score (0-20 points)
    const margin = parseFloat(profitMargin);
    if (margin > 30) {
      calculatedScore += 20;
    } else if (margin > 20) {
      calculatedScore += 15;
    } else if (margin > 10) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Trends score (0-20 points)
    if (trends.growing) calculatedScore += 20;
    else if (trends.stable) calculatedScore += 15;
    else if (trends.declining) calculatedScore += 5;

    // Barriers score (0-10 points)
    if (barriers.low) calculatedScore += 10;
    else if (barriers.medium) calculatedScore += 5;
    else if (barriers.high) calculatedScore += 0;

    // Requirements score (0-10 points)
    const requirementCount = Object.values(requirements).filter(Boolean).length;
    calculatedScore += (3 - requirementCount) * 3.33;

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
      productName: '',
      category: '',
      competitionLevel: 50,
      searchVolume: '',
      averagePrice: '',
      profitMargin: '',
      seasonality: '',
      trends: {
        growing: false,
        stable: false,
        declining: false,
      },
      barriers: {
        high: false,
        medium: false,
        low: false,
      },
      requirements: {
        certification: false,
        specialHandling: false,
        restricted: false,
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Product Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Product Category"
                >
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="home">Home & Kitchen</MenuItem>
                  <MenuItem value="beauty">Beauty & Personal Care</MenuItem>
                  <MenuItem value="clothing">Clothing & Accessories</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>Competition Level</Typography>
              <Slider
                value={formData.competitionLevel}
                onChange={(_, value) => handleInputChange('competitionLevel', value.toString())}
                valueLabelDisplay="auto"
                step={1}
                marks
                min={0}
                max={100}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Search Volume"
                type="number"
                value={formData.searchVolume}
                onChange={(e) => handleInputChange('searchVolume', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Average Price ($)"
                type="number"
                value={formData.averagePrice}
                onChange={(e) => handleInputChange('averagePrice', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
                label="Profit Margin (%)"
                type="number"
                value={formData.profitMargin}
                onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seasonality"
                value={formData.seasonality}
                onChange={(e) => handleInputChange('seasonality', e.target.value)}
                placeholder="e.g., Summer, Holiday, Year-round"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Market Trends
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.trends.growing}
                      onChange={() => handleTrendChange('growing')}
                    />
                  }
                  label="Growing"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.trends.stable}
                      onChange={() => handleTrendChange('stable')}
                    />
                  }
                  label="Stable"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.trends.declining}
                      onChange={() => handleTrendChange('declining')}
                    />
                  }
                  label="Declining"
                />
              </Box>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Entry Barriers
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.barriers.high}
                      onChange={() => handleBarrierChange('high')}
                    />
                  }
                  label="High"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.barriers.medium}
                      onChange={() => handleBarrierChange('medium')}
                    />
                  }
                  label="Medium"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.barriers.low}
                      onChange={() => handleBarrierChange('low')}
                    />
                  }
                  label="Low"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Special Requirements
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requirements.certification}
                      onChange={() => handleRequirementChange('certification')}
                    />
                  }
                  label="Certification Required"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requirements.specialHandling}
                      onChange={() => handleRequirementChange('specialHandling')}
                    />
                  }
                  label="Special Handling"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.requirements.restricted}
                      onChange={() => handleRequirementChange('restricted')}
                    />
                  }
                  label="Restricted Product"
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
      title="Product Research Validator"
      description="Evaluate your product idea's potential success on Amazon. Get a comprehensive analysis of market viability and entry requirements."
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