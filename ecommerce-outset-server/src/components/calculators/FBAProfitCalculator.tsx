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
  Alert,
} from '@mui/material';
import { BaseCalculator } from './BaseCalculator';

interface FBAProfitCalculatorProps {
  onLeadCapture?: (email: string, name: string) => Promise<void>;
}

export const FBAProfitCalculator: React.FC<FBAProfitCalculatorProps> = ({
  onLeadCapture,
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);
  const [score, setScore] = React.useState<number>();
  const [formData, setFormData] = React.useState({
    productCost: '',
    shippingCost: '',
    amazonPrice: '',
    category: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
    referralFee: '',
    fbaFees: '',
    storageFees: '',
    otherFees: '',
  });

  const steps = [
    {
      label: 'Product Details',
      description: 'Enter your product cost and selling price information.',
    },
    {
      label: 'Shipping & Dimensions',
      description: 'Specify shipping costs and product dimensions.',
    },
    {
      label: 'Amazon Fees',
      description: 'Enter Amazon fees and other costs.',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDimensionChange = (dimension: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
  };

  const calculateProfit = () => {
    const {
      productCost,
      shippingCost,
      amazonPrice,
      referralFee,
      fbaFees,
      storageFees,
      otherFees,
    } = formData;

    const totalCost = parseFloat(productCost) + parseFloat(shippingCost);
    const totalFees =
      parseFloat(referralFee) +
      parseFloat(fbaFees) +
      parseFloat(storageFees) +
      parseFloat(otherFees);
    const profit = parseFloat(amazonPrice) - totalCost - totalFees;
    const profitMargin = (profit / parseFloat(amazonPrice)) * 100;

    // Calculate score based on profit margin
    let calculatedScore = 0;
    if (profitMargin > 30) {
      calculatedScore = 100;
    } else if (profitMargin > 20) {
      calculatedScore = 80;
    } else if (profitMargin > 10) {
      calculatedScore = 60;
    } else if (profitMargin > 0) {
      calculatedScore = 40;
    } else {
      calculatedScore = 20;
    }

    setScore(calculatedScore);
    setIsComplete(true);
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      calculateProfit();
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
      productCost: '',
      shippingCost: '',
      amazonPrice: '',
      category: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
      referralFee: '',
      fbaFees: '',
      storageFees: '',
      otherFees: '',
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
                label="Product Cost ($)"
                type="number"
                value={formData.productCost}
                onChange={(e) => handleInputChange('productCost', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amazon Selling Price ($)"
                type="number"
                value={formData.amazonPrice}
                onChange={(e) => handleInputChange('amazonPrice', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Shipping Cost ($)"
                type="number"
                value={formData.shippingCost}
                onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Weight (lbs)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Product Dimensions (inches)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Length"
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Width"
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Height"
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Referral Fee (%)"
                type="number"
                value={formData.referralFee}
                onChange={(e) => handleInputChange('referralFee', e.target.value)}
                InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="FBA Fees ($)"
                type="number"
                value={formData.fbaFees}
                onChange={(e) => handleInputChange('fbaFees', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Storage Fees ($)"
                type="number"
                value={formData.storageFees}
                onChange={(e) => handleInputChange('storageFees', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Other Fees ($)"
                type="number"
                value={formData.otherFees}
                onChange={(e) => handleInputChange('otherFees', e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <BaseCalculator
      title="Amazon FBA Profit Calculator"
      description="Calculate your potential profit margins for Amazon FBA products. Get detailed insights and recommendations to optimize your pricing strategy."
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onReset={handleReset}
      isComplete={isComplete}
      score={score}
      personaType="STARTER"
      onLeadCapture={onLeadCapture}
    >
      {renderStepContent()}
    </BaseCalculator>
  );
}; 