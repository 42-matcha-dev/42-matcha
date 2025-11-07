import nodemailer from 'nodemailer';
import { google } from 'googleapis';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Gets a fresh access token using the refresh token
 */
const getAccessToken = async (): Promise<string> => {
  // Check if all required environment variables are set
  const requiredEnvVars = [
    'EMAIL_USER',
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_REFRESH_TOKEN',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URI (not used for refresh)
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('Failed to obtain access token');
    }
    return token;
  } catch (error: any) {
    if (error.message?.includes('invalid_grant')) {
      throw new Error(
        'Gmail OAuth2 refresh token is invalid or has been revoked. ' +
        'Please generate a new refresh token in the Google Cloud Console.'
      );
    }
    throw new Error(`Failed to refresh access token: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Creates a nodemailer transporter with Gmail OAuth2 configuration
 * Automatically refreshes the access token before creating the transporter
 */
const createTransporter = async () => {
  const accessToken = await getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });
};

/**
 * Sends an email using Gmail OAuth2
 * @param options Email options (to, subject, text, html)
 * @throws Error with descriptive message if email sending fails
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  } catch (error: any) {
    // Handle OAuth2 authentication errors specifically
    if (error.code === 'EAUTH' || error.command === 'AUTH XOAUTH2') {
      const errorMessage = error.message || '';

      if (errorMessage.includes('expired') || errorMessage.includes('revoked')) {
        throw new Error(
          'Email service authentication failed: Gmail OAuth2 token has expired or been revoked. ' +
          'Please generate a new refresh token in the Google Cloud Console and update GMAIL_REFRESH_TOKEN environment variable.'
        );
      }

      throw new Error(
        `Email service authentication failed: ${errorMessage}. ` +
        'Please verify your Gmail OAuth2 credentials (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN).'
      );
    }

    // Handle other nodemailer errors
    if (error.code) {
      throw new Error(`Email sending failed: ${error.code} - ${error.message}`);
    }

    // Generic error
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
  }
};

