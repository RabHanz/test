import axios from 'axios';

interface LeadData {
  email: string;
  name: string;
  calculatorType?: string;
  score?: number;
  personaType?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
}

class HubSpotService {
  private readonly apiKey: string;
  private readonly portalId: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_HUBSPOT_API_KEY || '';
    this.portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '';
    this.baseUrl = 'https://api.hubapi.com';
  }

  private async createContact(leadData: LeadData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/contacts`,
        {
          properties: {
            email: leadData.email,
            firstname: leadData.name.split(' ')[0],
            lastname: leadData.name.split(' ').slice(1).join(' '),
            calculator_type: leadData.calculatorType,
            calculator_score: leadData.score?.toString(),
            persona_type: leadData.personaType,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      throw error;
    }
  }

  private async createDeal(leadData: LeadData, contactId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/crm/v3/objects/deals`,
        {
          properties: {
            dealname: `${leadData.calculatorType} Calculator Lead`,
            pipeline: 'default',
            dealstage: 'appointmentscheduled',
            calculator_type: leadData.calculatorType,
            calculator_score: leadData.score?.toString(),
            persona_type: leadData.personaType,
          },
          associations: [
            {
              to: { id: contactId },
              types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      throw error;
    }
  }

  async captureLead(leadData: LeadData) {
    try {
      // Create contact in HubSpot
      const contact = await this.createContact(leadData);
      
      // Create deal and associate it with the contact
      if (contact.id) {
        await this.createDeal(leadData, contact.id);
      }

      return {
        success: true,
        message: 'Lead captured successfully',
        data: contact,
      };
    } catch (error) {
      console.error('Error capturing lead:', error);
      return {
        success: false,
        message: 'Failed to capture lead',
        error,
      };
    }
  }
}

export const hubspotService = new HubSpotService(); 