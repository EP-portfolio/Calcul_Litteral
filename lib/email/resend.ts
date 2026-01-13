import { Resend } from 'resend'

// Validate required environment variables
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables')
}

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev' // Default for testing

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://calcul-litteral.vercel.app'
