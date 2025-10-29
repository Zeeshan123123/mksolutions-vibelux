import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../configurations/route';
import { DELETE } from '../configurations/[id]/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    alertConfiguration: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}));

jest.mock('@/lib/auth-options', () => ({
  authOptions: {}
}));

describe('Alert Configuration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/settings/alerts/configurations', () => {
    it('should return alert configurations for a facility', async () => {
      const mockSession = { user: { id: 'user-1' } };
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(mockSession as any);

      const mockConfigurations = [
        {
          id: 'config-1',
          facilityId: 'facility-1',
          sensorId: 'sensor-1',
          name: 'High Temperature Alert',
          alertType: 'TEMPERATURE_HIGH',
          condition: 'GT',
          threshold: 30,
          severity: 'HIGH',
          enabled: true,
          sensor: {
            id: 'sensor-1',
            name: 'Temp Sensor 1',
            sensorType: 'TEMPERATURE',
            zone: {
              id: 'zone-1',
              name: 'Zone 1'
            }
          }
        }
      ];

      (prisma.alertConfiguration.findMany as jest.MockedFunction<any>).mockResolvedValue(mockConfigurations);

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations?facilityId=facility-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.configurations).toEqual(mockConfigurations);
      expect(prisma.alertConfiguration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { facilityId: 'facility-1' }
        })
      );
    });

    it('should require authentication', async () => {
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations?facilityId=facility-1');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should require facilityId parameter', async () => {
      const mockSession = { user: { id: 'user-1' } };
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Facility ID is required');
    });
  });

  describe('POST /api/settings/alerts/configurations', () => {
    it('should create a new alert configuration', async () => {
      const mockSession = { user: { id: 'user-1' } };
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(mockSession as any);

      const newConfig = {
        facilityId: 'facility-1',
        sensorId: 'sensor-1',
        name: 'High Temperature Alert',
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 30,
        severity: 'HIGH',
        cooldownMinutes: 15,
        actions: { email: true, sms: false, push: true, webhook: false },
        enabled: true
      };

      const mockCreated = {
        id: 'config-1',
        ...newConfig,
        sensor: {
          id: 'sensor-1',
          name: 'Temp Sensor 1'
        }
      };

      (prisma.alertConfiguration.create as jest.MockedFunction<any>).mockResolvedValue(mockCreated);

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations', {
        method: 'POST',
        body: JSON.stringify(newConfig)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.configuration).toEqual(mockCreated);
      expect(prisma.alertConfiguration.create).toHaveBeenCalled();
    });

    it('should update an existing alert configuration', async () => {
      const mockSession = { user: { id: 'user-1' } };
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(mockSession as any);

      const updateConfig = {
        id: 'config-1',
        facilityId: 'facility-1',
        sensorId: 'sensor-1',
        name: 'Updated Alert',
        alertType: 'TEMPERATURE_HIGH',
        condition: 'GT',
        threshold: 35,
        severity: 'CRITICAL',
        cooldownMinutes: 20,
        enabled: true
      };

      const mockUpdated = {
        ...updateConfig,
        sensor: {
          id: 'sensor-1',
          name: 'Temp Sensor 1'
        }
      };

      (prisma.alertConfiguration.update as jest.MockedFunction<any>).mockResolvedValue(mockUpdated);

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations', {
        method: 'POST',
        body: JSON.stringify(updateConfig)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.configuration).toEqual(mockUpdated);
      expect(prisma.alertConfiguration.update).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const mockSession = { user: { id: 'user-1' } };
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(mockSession as any);

      const invalidConfig = {
        facilityId: 'facility-1'
        // Missing required fields
      };

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations', {
        method: 'POST',
        body: JSON.stringify(invalidConfig)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });
  });

  describe('DELETE /api/settings/alerts/configurations/[id]', () => {
    it('should soft delete a configuration by setting enabled to false', async () => {
      const mockSession = { user: { id: 'user-1' } };
      (getServerSession as jest.MockedFunction<typeof getServerSession>).mockResolvedValue(mockSession as any);

      (prisma.alertConfiguration.update as jest.MockedFunction<any>).mockResolvedValue({
        id: 'config-1',
        enabled: false
      });

      const request = new NextRequest('http://localhost/api/settings/alerts/configurations/config-1', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'config-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.alertConfiguration.update).toHaveBeenCalledWith({
        where: { id: 'config-1' },
        data: { enabled: false }
      });
    });
  });
});

