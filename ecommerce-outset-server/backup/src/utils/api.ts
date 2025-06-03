import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import mailchimp from '@mailchimp/mailchimp_marketing';
import { google } from 'googleapis';
import { Client } from '@hubspot/api-client';
import { WebClient } from '@slack/web-api';
import Zoom from 'zoomapi';

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Stripe (optional)
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  : null;

// Initialize Mailchimp (optional)
if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX) {
  mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
  });
}

// Initialize Google Calendar (optional)
let calendar = null;
if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  calendar = google.calendar({ version: 'v3', auth });
}

// Initialize HubSpot (optional)
export const hubspot = process.env.HUBSPOT_API_KEY 
  ? new Client({ accessToken: process.env.HUBSPOT_API_KEY })
  : null;

// Initialize Slack (optional)
export const slack = process.env.SLACK_BOT_TOKEN 
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

// Initialize Zoom (optional)
export const zoom = process.env.ZOOM_API_KEY && process.env.ZOOM_API_SECRET
  ? new Zoom({
      apiKey: process.env.ZOOM_API_KEY,
      apiSecret: process.env.ZOOM_API_SECRET,
    })
  : null;

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
    if (!process.env.MAILCHIMP_LIST_ID) {
      console.warn('Mailchimp integration not configured');
      return { status: 'skipped', message: 'Mailchimp not configured' };
    }
    return mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
      email_address: email,
      status: 'subscribed',
    });
  },

  // Payment processing
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    if (!stripe) {
      console.warn('Stripe integration not configured');
      return { status: 'skipped', message: 'Stripe not configured' };
    }
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
    if (!calendar) {
      console.warn('Google Calendar integration not configured');
      return { status: 'skipped', message: 'Calendar not configured' };
    }
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
    if (!hubspot) {
      console.warn('HubSpot integration not configured');
      return { status: 'skipped', message: 'HubSpot not configured' };
    }
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
    if (!slack) {
      console.warn('Slack integration not configured');
      return { status: 'skipped', message: 'Slack not configured' };
    }
    return slack.chat.postMessage({
      channel,
      text: message,
    });
  },

  // Zoom integration
  async createZoomMeeting(topic: string, startTime: Date) {
    if (!zoom) {
      console.warn('Zoom integration not configured');
      return { status: 'skipped', message: 'Zoom not configured' };
    }
    return zoom.meetings.create({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: 60, // 1 hour
    });
  },
}; 