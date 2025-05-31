import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FBAProfitCalculator from '@/components/calculators/FBAProfitCalculator';

// Mock the analytics service
jest.mock('@/services/analytics', () => ({
  AnalyticsService: {
    trackCalculatorUse: jest.fn(),
  },
}));

describe('FBAProfitCalculator', () => {
  const mockProps = {
    onLeadCapture: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the calculator with all input fields', () => {
    render(<FBAProfitCalculator {...mockProps} />);
    
    // Check if all input fields are rendered
    expect(screen.getByLabelText(/product cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/shipping cost/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amazon fees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/selling price/i)).toBeInTheDocument();
  });

  it('calculates profit and updates score when inputs change', () => {
    render(<FBAProfitCalculator {...mockProps} />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/product cost/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/shipping cost/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/amazon fees/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/selling price/i), { target: { value: '50' } });
    
    // Check if profit is calculated correctly
    expect(screen.getByText(/profit: \$20/i)).toBeInTheDocument();
    
    // Check if score is updated
    expect(screen.getByText(/score: 80/i)).toBeInTheDocument();
  });

  it('shows lead capture form when score is high enough', () => {
    render(<FBAProfitCalculator {...mockProps} />);
    
    // Fill in the form with high profit margin
    fireEvent.change(screen.getByLabelText(/product cost/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/shipping cost/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/amazon fees/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/selling price/i), { target: { value: '100' } });
    
    // Check if lead capture form is shown
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('calls onLeadCapture when form is submitted', () => {
    render(<FBAProfitCalculator {...mockProps} />);
    
    // Fill in the form with high profit margin
    fireEvent.change(screen.getByLabelText(/product cost/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/shipping cost/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/amazon fees/i), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText(/selling price/i), { target: { value: '100' } });
    
    // Fill in lead capture form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Check if onLeadCapture was called with correct data
    expect(mockProps.onLeadCapture).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Test User',
      calculatorType: 'fba-profit',
      score: 90,
      results: expect.any(Object),
    });
  });
}); 