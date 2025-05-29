import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { google } from 'googleapis';
import { Client } from '@hubspot/api-client';
import { WebClient } from '@slack/web-api';
import { Zoom } from 'zoomapi';
import { ClickUp } from '@clickup/api';

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Initialize Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

// Initialize Google Calendar
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

export const calendar = google.calendar({ version: 'v3', auth });

// Initialize HubSpot
export const hubspot = new Client({ accessToken: process.env.HUBSPOT_API_KEY });

// Initialize Slack
export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Initialize Zoom
export const zoom = new Zoom({
  apiKey: process.env.ZOOM_API_KEY,
  apiSecret: process.env.ZOOM_API_SECRET,
});

// Initialize ClickUp
export const clickup = new ClickUp(process.env.CLICKUP_API_KEY);

// API utility functions
export const api = {
  // User management
  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { programs: true, activities: true },
    });
  },

  // Program management
  async getPrograms(userId: string) {
    return prisma.program.findMany({
      where: { users: { some: { id: userId } } },
      include: { activities: true },
    });
  },

  // Activity tracking
  async createActivity(data: {
    type: string;
    status: string;
    userId: string;
    programId: string;
  }) {
    return prisma.activity.create({ data });
  },

  // Email marketing
  async subscribeToNewsletter(email: string) {
    return mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID!, {
      email_address: email,
      status: 'subscribed',
    });
  },

  // Payment processing
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    return stripe.paymentIntents.create({
      amount,
      currency,
    });
  },

  // Calendar integration
  async createCalendarEvent(event: {
    summary: string;
    description: string;
    start: Date;
    end: Date;
  }) {
    return calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
      },
    });
  },

  // CRM integration
  async createContact(data: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    return hubspot.crm.contacts.basicApi.create({
      properties: {
        email: data.email,
        firstname: data.firstName,
        lastname: data.lastName,
      },
    });
  },

  // Slack integration
  async sendSlackMessage(channel: string, message: string) {
    return slack.chat.postMessage({
      channel,
      text: message,
    });
  },

  // Zoom integration
  async createZoomMeeting(topic: string, startTime: Date) {
    return zoom.meetings.create({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: 60, // 1 hour
    });
  },

  // Project management
  async createClickUpTask(data: {
    name: string;
    description: string;
    listId: string;
  }) {
    return clickup.tasks.create({
      name: data.name,
      description: data.description,
      list_id: data.listId,
    });
  },
}; 