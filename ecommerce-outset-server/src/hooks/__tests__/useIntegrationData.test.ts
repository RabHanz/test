import { renderHook, act } from '@testing-library/react-hooks';
import { useIntegrationData } from '../useIntegrationData';
import { IntegrationService } from '../../services/IntegrationService';
import { IntegrationProject, IntegrationStatus, IntegrationType, IntegrationProtocol } from '../../types/integration';

// Mock the IntegrationService
jest.mock('../../services/IntegrationService');

const mockIntegration: IntegrationProject = {
  id: '1',
  name: 'Test Integration',
  description: 'Test Description',
  type: IntegrationType.API,
  protocol: IntegrationProtocol.REST,
  status: IntegrationStatus.ACTIVE,
  sourceSystem: 'System A',
  targetSystem: 'System B',
  ownerId: 'user1',
  teamId: 'team1',
  endpointUrl: 'https://api.example.com/v1',
  securityType: 'API_KEY',
  credentials: { apiKey: 'test-key' },
  config: { timeout: 5000 },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

describe('useIntegrationData', () => {
  let mockGetIntegrations: jest.Mock;
  let mockGetIntegrationById: jest.Mock;
  let mockCreateIntegration: jest.Mock;
  let mockUpdateIntegration: jest.Mock;
  let mockDeleteIntegration: jest.Mock;
  let mockGetMetrics: jest.Mock;
  let mockGetLogs: jest.Mock;
  let mockGetAlerts: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockGetIntegrations = jest.fn().mockResolvedValue([mockIntegration]);
    mockGetIntegrationById = jest.fn().mockResolvedValue(mockIntegration);
    mockCreateIntegration = jest.fn().mockResolvedValue(mockIntegration);
    mockUpdateIntegration = jest.fn().mockResolvedValue(mockIntegration);
    mockDeleteIntegration = jest.fn().mockResolvedValue(undefined);
    mockGetMetrics = jest.fn().mockResolvedValue([]);
    mockGetLogs = jest.fn().mockResolvedValue([]);
    mockGetAlerts = jest.fn().mockResolvedValue([]);

    // Assign mocks to IntegrationService
    (IntegrationService as jest.Mock).mockImplementation(() => ({
      getIntegrations: mockGetIntegrations,
      getIntegrationById: mockGetIntegrationById,
      createIntegration: mockCreateIntegration,
      updateIntegration: mockUpdateIntegration,
      deleteIntegration: mockDeleteIntegration,
      getMetrics: mockGetMetrics,
      getLogs: mockGetLogs,
      getAlerts: mockGetAlerts,
    }));
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useIntegrationData());

    expect(result.current.integrations).toEqual([]);
    expect(result.current.selectedIntegration).toBeNull();
    expect(result.current.logs).toEqual([]);
    expect(result.current.metrics).toEqual([]);
    expect(result.current.alerts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads integrations on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    expect(result.current.isLoading).toBe(true);
    await waitForNextUpdate();

    expect(mockGetIntegrations).toHaveBeenCalled();
    expect(result.current.integrations).toEqual([mockIntegration]);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles load error', async () => {
    const error = new Error('Failed to load integrations');
    mockGetIntegrations.mockRejectedValueOnce(error);

    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('selects an integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    act(() => {
      result.current.selectIntegration(mockIntegration.id);
    });

    expect(mockGetIntegrationById).toHaveBeenCalledWith(mockIntegration.id);
    expect(result.current.selectedIntegration).toEqual(mockIntegration);
  });

  it('creates a new integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    const newIntegration = {
      name: 'New Integration',
      description: 'New Description',
      type: IntegrationType.API,
      protocol: IntegrationProtocol.REST,
      sourceSystem: 'System A',
      targetSystem: 'System B',
    };

    act(() => {
      result.current.createIntegration(newIntegration);
    });

    await waitForNextUpdate();

    expect(mockCreateIntegration).toHaveBeenCalledWith(newIntegration);
    expect(result.current.integrations).toContainEqual(mockIntegration);
  });

  it('updates an integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    const updates = {
      name: 'Updated Integration',
      description: 'Updated Description',
    };

    act(() => {
      result.current.updateIntegration(mockIntegration.id, updates);
    });

    await waitForNextUpdate();

    expect(mockUpdateIntegration).toHaveBeenCalledWith(mockIntegration.id, updates);
  });

  it('deletes an integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    act(() => {
      result.current.deleteIntegration(mockIntegration.id);
    });

    await waitForNextUpdate();

    expect(mockDeleteIntegration).toHaveBeenCalledWith(mockIntegration.id);
    expect(result.current.integrations).not.toContainEqual(mockIntegration);
  });

  it('loads metrics for selected integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    act(() => {
      result.current.selectIntegration(mockIntegration.id);
    });

    await waitForNextUpdate();

    expect(mockGetMetrics).toHaveBeenCalledWith(mockIntegration.id);
  });

  it('loads logs for selected integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    act(() => {
      result.current.selectIntegration(mockIntegration.id);
    });

    await waitForNextUpdate();

    expect(mockGetLogs).toHaveBeenCalledWith(mockIntegration.id);
  });

  it('loads alerts for selected integration', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useIntegrationData());

    await waitForNextUpdate();

    act(() => {
      result.current.selectIntegration(mockIntegration.id);
    });

    await waitForNextUpdate();

    expect(mockGetAlerts).toHaveBeenCalledWith(mockIntegration.id);
  });
}); 