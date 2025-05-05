import nodemailer from 'nodemailer';

import {configs} from '../../../configs';

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
        notice: string;
    }) {
        try {
            const template = {
                to: `${configs.adminMail}`,
                subject: `New Contact Request from ${data.name}`,
                html: buildContactEmailTemplate({
                    name: data.name,
                    phone: data.phone,
                    notice: data.notice,
                }),
            };

            return await this.sendEmail(template);
        } catch (error) {
            console.error('Error sending contact email:', error);
        }
    }

    async sendEmail(data: { to: string; subject: string; text?: string; html?: string }) {
        const {to, subject, text, html} = data;
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
            console.error('Error occurred:', error);
            throw error;
        }
    }
}

const mailService = new MailService();

export {mailService};

const buildContactEmailTemplate = ({name, phone, notice}) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Notice</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${notice}</td>
                </tr>
            </table>
            <p style="margin-top: 20px; color: #777; font-size: 12px;">This message was generated automatically from your website contact form.</p>
        </div>
    `;
