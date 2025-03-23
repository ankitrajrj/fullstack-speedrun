// /utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

// Create reusable transporter with Mailtrap credentials from environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,  // Using environment variables
      pass: process.env.MAILTRAP_PASS   // Using environment variables
    }
  });
};

/**
 * Send verification email
 * @param {string} email - Recipient email
 * @param {string} token - Verification token
 */
export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();  // Create transporter for each email

    const verificationLink = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;
    
    const mailOptions = {
      from: '"Your App" <noreply@yourapp.com>',  // Sender email
      to: email,  // Recipient email
      subject: 'Verify Your Email',  // Email subject
      text: `Please click on the following link to verify your email: ${verificationLink}`,  // Plain-text body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If the button doesn't work, you can also click on the link below or copy it to your browser:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} token - Reset token
 */
export const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();  // Create transporter for each email
    
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: '"Your App" <noreply@yourapp.com>',  // Sender email
      to: email,  // Recipient email
      subject: 'Reset Your Password',  // Email subject
      text: `Please click on the following link to reset your password: ${resetLink}`,  // Plain-text body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested a password reset. Please click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also click on the link below or copy it to your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
