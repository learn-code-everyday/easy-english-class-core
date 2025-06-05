import nodemailer from "nodemailer";

import { configs } from "../../../configs";

class MailService {
  private transporter: {
    sendMail: (arg0: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    }) => any;
  };

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: `${configs.smtpHost}`,
      port: `${configs.smtpPort}`,
      secure: false,
      auth: {
        user: `${configs.smtpUser}`,
        pass: `${configs.smtpPassword}`,
      },
    });
  }

  async notificationForContactRequest(data: {
    name: string;
    phone: string;
    email: string;
    notice: string;
  }) {
    try {
      const template = {
        to: `${configs.adminMail}`,
        subject: `New contact request from ${data.name}`,
        html: buildContactEmailTemplate({
          name: data.name,
          phone: data.phone,
          email: data.email,
          notice: data.notice,
        }),
      };

      return await this.sendEmail(template);
    } catch (error) {
      console.error("Error sending contact email:", error);
    }
  }

  async sendEmail(data: { to: string; subject: string; text?: string; html?: string }) {
    const { to, subject, text, html } = data;
    const mailOptions = {
      from: `${configs.mailerFrom}`,
      to,
      subject,
      text,
      html,
    };

    try {
      return this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(data: {
    name: string;
    gmail: string;
    role?: string;
    tempPassword?: string;
  }) {
    try {
      const template = {
        to: data.gmail,
        subject: `Welcome to Botanika - Your Account is Ready!`,
        html: buildWelcomeEmailTemplate({
          name: data.name,
          email: data.gmail,
          role: data.role || "User",
          tempPassword: data.tempPassword,
        }),
      };

      return await this.sendEmail(template);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }
  }
}

const mailService = new MailService();

export { mailService };

const buildContactEmailTemplate = ({ name, phone, email, notice }) => {
  const contactMethod = phone
    ? `<tr>
         <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
         <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
       </tr>`
    : email
      ? `<tr>
         <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
         <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
       </tr>`
      : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Request</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        ${contactMethod}
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${notice}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; color: #777; font-size: 12px;">This message was automatically generated from the contact form on your website.</p>
    </div>
  `;
};

const buildWelcomeEmailTemplate = ({ name, email, role, tempPassword }) => {
  const passwordSection = tempPassword
    ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
            <p style="color: #dc3545; font-size: 14px;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        </div>
        `
    : "";

  const loginUrl = "https://botanika.com/login";

  const roleMessage =
    role === "MERCHANT"
      ? "You have been granted Merchant access to our platform."
      : role === "SALES"
        ? "You have been granted Sales access to our platform."
        : "Welcome to our platform!";

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #28a745; margin: 0;">Welcome to Botanika!</h1>
                <p style="color: #666; margin: 5px 0;">Your account has been successfully created</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
                <p style="color: #555; line-height: 1.6;">
                    ${roleMessage} We're excited to have you join our community and look forward to supporting your journey with us.
                </p>
            </div>
    
            ${passwordSection}
    
            <div style="margin: 30px 0;">
                <h3 style="color: #333;">Getting Started</h3>
                <ul style="color: #555; line-height: 1.8;">
                    <li>Log in to your account using the credentials above</li>
                    <li>Complete your profile setup</li>
                    <li>Explore the dashboard and available features</li>
                    ${role === "MERCHANT" ? "<li>Set up your merchant settings and preferences</li>" : ""}
                    ${role === "SALES" ? "<li>Access your sales tools and resources</li>" : ""}
                </ul>
            </div>
    
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #555; margin-bottom: 15px;">Please login to your account at:</p>
                <a href="${loginUrl}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 10px;">
                    Login to Your Account
                </a>
                <br>
                <a href="${loginUrl}" style="color: #28a745; text-decoration: none; font-size: 14px;">
                    ${loginUrl}
                </a>
            </div>
    
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #777; font-size: 14px;">
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                <p style="margin-bottom: 0;">Best regards,<br><strong>The Botanika Team</strong></p>
            </div>
    
            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
                This email was automatically generated. Please do not reply to this email.
            </p>
        </div>
        `;
};
