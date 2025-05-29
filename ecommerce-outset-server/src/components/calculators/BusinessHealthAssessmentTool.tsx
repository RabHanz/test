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

interface BusinessHealthAssessmentToolProps {
  onLeadCapture?: (email: string, name: string) => Promise<void>;
}

export const BusinessHealthAssessmentTool: React.FC<BusinessHealthAssessmentToolProps> = ({
  onLeadCapture,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [score, setScore] = React.useState<number>();
  const [formData, setFormData] = React.useState({
    monthlyRevenue: '',
    profitMargin: '',
    acos: '',
    inventoryTurnover: '',
    customerRating: '',
    returnRate: '',
    businessAge: '',
    productCount: '',
    metrics: {
      salesGrowth: false,
      profitGrowth: false,
      inventoryEfficiency: false,
    },
    operations: {
      automation: false,
      outsourcing: false,
      systems: false,
    },
    riskManagement: {
      diversification: false,
      insurance: false,
      compliance: false,
    },
  });

  const steps = [
    {
      label: 'Financial Metrics',
      description: 'Enter your key financial performance indicators.',
    },
    {
      label: 'Operational Metrics',
      description: 'Input your business operations and efficiency data.',
    },
    {
      label: 'Risk & Growth',
      description: 'Assess your business growth and risk management.',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetricsChange = (metric: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metric]: !prev.metrics[metric as keyof typeof prev.metrics],
      },
    }));
  };

  const handleOperationsChange = (operation: string) => {
    setFormData((prev) => ({
      ...prev,
      operations: {
        ...prev.operations,
        [operation]: !prev.operations[operation as keyof typeof prev.operations],
      },
    }));
  };

  const handleRiskManagementChange = (risk: string) => {
    setFormData((prev) => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [risk]: !prev.riskManagement[risk as keyof typeof prev.riskManagement],
      },
    }));
  };

  const calculateScore = () => {
    let calculatedScore = 0;
    const {
      monthlyRevenue,
      profitMargin,
      acos,
      inventoryTurnover,
      customerRating,
      returnRate,
      businessAge,
      productCount,
      metrics,
      operations,
      riskManagement,
    } = formData;

    // Revenue score (0-20 points)
    const revenue = parseFloat(monthlyRevenue);
    if (revenue > 100000) {
      calculatedScore += 20;
    } else if (revenue > 50000) {
      calculatedScore += 15;
    } else if (revenue > 25000) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Profitability score (0-20 points)
    const margin = parseFloat(profitMargin);
    const acosValue = parseFloat(acos);
    const profitabilityScore = margin - acosValue;
    if (profitabilityScore > 30) {
      calculatedScore += 20;
    } else if (profitabilityScore > 20) {
      calculatedScore += 15;
    } else if (profitabilityScore > 10) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Operational efficiency score (0-20 points)
    const turnover = parseFloat(inventoryTurnover);
    const rating = parseFloat(customerRating);
    const returns = parseFloat(returnRate);
    const efficiencyScore = (turnover * rating) / (returns + 1);
    if (efficiencyScore > 50) {
      calculatedScore += 20;
    } else if (efficiencyScore > 30) {
      calculatedScore += 15;
    } else if (efficiencyScore > 15) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Business maturity score (0-20 points)
    const age = parseFloat(businessAge);
    const products = parseFloat(productCount);
    const maturityScore = (age * products) / 10;
    if (maturityScore > 20) {
      calculatedScore += 20;
    } else if (maturityScore > 10) {
      calculatedScore += 15;
    } else if (maturityScore > 5) {
      calculatedScore += 10;
    } else {
      calculatedScore += 5;
    }

    // Growth metrics score (0-10 points)
    const growthScore = Object.values(metrics).filter(Boolean).length * 3.33;
    calculatedScore += growthScore;

    // Operations optimization score (0-5 points)
    const operationsScore = Object.values(operations).filter(Boolean).length * 1.67;
    calculatedScore += operationsScore;

    // Risk management score (0-5 points)
    const riskScore = Object.values(riskManagement).filter(Boolean).length * 1.67;
    calculatedScore += riskScore;

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
      monthlyRevenue: '',
      profitMargin: '',
      acos: '',
      inventoryTurnover: '',
      customerRating: '',
      returnRate: '',
      businessAge: '',
      productCount: '',
      metrics: {
        salesGrowth: false,
        profitGrowth: false,
        inventoryEfficiency: false,
      },
      operations: {
        automation: false,
        outsourcing: false,
        systems: false,
      },
      riskManagement: {
        diversification: false,
        insurance: false,
        compliance: false,
      },
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Revenue ($)"
                type="number"
                value={formData.monthlyRevenue}
                onChange={(e) => handleInputChange('monthlyRevenue', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
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
                label="ACOS (%)"
                type="number"
                value={formData.acos}
                onChange={(e) => handleInputChange('acos', e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Inventory Turnover (times/year)"
                type="number"
                value={formData.inventoryTurnover}
                onChange={(e) => handleInputChange('inventoryTurnover', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
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
                label="Customer Rating (1-5)"
                type="number"
                value={formData.customerRating}
                onChange={(e) => handleInputChange('customerRating', e.target.value)}
                InputProps={{ inputProps: { min: 1, max: 5, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Return Rate (%)"
                type="number"
                value={formData.returnRate}
                onChange={(e) => handleInputChange('returnRate', e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Age (months)"
                type="number"
                value={formData.businessAge}
                onChange={(e) => handleInputChange('businessAge', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Products"
                type="number"
                value={formData.productCount}
                onChange={(e) => handleInputChange('productCount', e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Growth Metrics
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.metrics.salesGrowth}
                      onChange={() => handleMetricsChange('salesGrowth')}
                    />
                  }
                  label="Consistent Sales Growth"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.metrics.profitGrowth}
                      onChange={() => handleMetricsChange('profitGrowth')}
                    />
                  }
                  label="Profit Growth"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.metrics.inventoryEfficiency}
                      onChange={() => handleMetricsChange('inventoryEfficiency')}
                    />
                  }
                  label="Inventory Efficiency"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Operations
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operations.automation}
                      onChange={() => handleOperationsChange('automation')}
                    />
                  }
                  label="Process Automation"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operations.outsourcing}
                      onChange={() => handleOperationsChange('outsourcing')}
                    />
                  }
                  label="Strategic Outsourcing"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.operations.systems}
                      onChange={() => handleOperationsChange('systems')}
                    />
                  }
                  label="Business Systems"
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Risk Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.riskManagement.diversification}
                      onChange={() => handleRiskManagementChange('diversification')}
                    />
                  }
                  label="Product Diversification"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.riskManagement.insurance}
                      onChange={() => handleRiskManagementChange('insurance')}
                    />
                  }
                  label="Business Insurance"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.riskManagement.compliance}
                      onChange={() => handleRiskManagementChange('compliance')}
                    />
                  }
                  label="Regulatory Compliance"
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
      title="Business Health Assessment"
      description="Evaluate your Amazon business health with a comprehensive analysis of financial, operational, and growth metrics."
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