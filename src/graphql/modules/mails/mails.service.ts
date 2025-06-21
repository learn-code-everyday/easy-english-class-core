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
    this.transporter = (nodemailer as any).createTransport({
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
    language?: "vi" | "en";
  }) {
    try {
      const lang = data.language || "vi";
      const template = {
        to: `${configs.adminMail}`,
        subject:
          lang === "vi"
            ? `Yêu cầu liên hệ mới từ ${data.name}`
            : `New contact request from ${data.name}`,
        html: buildContactEmailTemplate({
          name: data.name,
          phone: data.phone,
          email: data.email,
          notice: data.notice,
          language: lang,
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
    language?: "vi" | "en";
  }) {
    try {
      const lang = data.language || "vi";
      const template = {
        to: data.gmail,
        subject:
          lang === "vi"
            ? `Chào mừng đến với Botanika - Tài khoản của bạn đã sẵn sàng!`
            : `Welcome to Botanika - Your Account is Ready!`,
        html: buildWelcomeEmailTemplate({
          name: data.name,
          email: data.gmail,
          role: data.role || "User",
          tempPassword: data.tempPassword,
          language: lang,
        }),
      };

      return await this.sendEmail(template);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }
  }

  async sendResetPassword(data: {
    name: string;
    gmail: string;
    otp: string;
    language?: "vi" | "en";
  }) {
    try {
      const lang = data.language || "vi";
      const template = {
        to: data.gmail,
        subject:
          lang === "vi"
            ? `Đặt lại mật khẩu tài khoản Botanika của bạn`
            : `Reset Your Botanika Account Password`,
        html: buildResetPasswordOTPTemplate({
          name: data.name,
          otp: data.otp,
          language: lang,
        }),
      };

      return await this.sendEmail(template);
    } catch (error) {
      console.error("Error sending reset password email:", error);
      throw error;
    }
  }
}

const mailService = new MailService();

export { mailService };

const buildContactEmailTemplate = ({ name, phone, email, notice, language = "vi" }) => {
  const isVi = language === "vi";

  const contactMethod = phone
    ? `<tr>
         <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>${isVi ? "Điện thoại" : "Phone"}</strong></td>
         <td style="padding: 12px; border: 1px solid #ddd;">${phone}</td>
       </tr>`
    : email
      ? `<tr>
         <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Email</strong></td>
         <td style="padding: 12px; border: 1px solid #ddd;">${email}</td>
       </tr>`
      : "";

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff7125; margin: 0;">${isVi ? "Yêu cầu liên hệ mới" : "New Contact Request"}</h1>
                <p style="color: #666; margin: 5px 0;">${isVi ? "Từ website của bạn" : "From your website"}</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>${isVi ? "Tên" : "Name"}</strong></td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${name}</td>
                    </tr>
                    ${contactMethod}
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>${isVi ? "Tin nhắn" : "Message"}</strong></td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${notice}</td>
                    </tr>
                </table>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #777; font-size: 14px;">
                <p>${isVi ? "Vui lòng phản hồi yêu cầu này trong thời gian sớm nhất." : "Please respond to this request as soon as possible."}</p>
                <p style="margin-bottom: 0;">${isVi ? "Trân trọng," : "Best regards,"}<br><strong>${isVi ? "Đội ngũ Botanika" : "The Botanika Team"}</strong></p>
            </div>
            
            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
                ${isVi ? "Email này được tạo tự động từ form liên hệ trên website." : "This message was automatically generated from the contact form on your website."}
            </p>
        </div>
    `;
};

const buildWelcomeEmailTemplate = ({ name, email, role, tempPassword, language = "vi" }) => {
  const isVi = language === "vi";

  const passwordSection = tempPassword
    ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #ff7125; margin-top: 0;">${isVi ? "Thông tin đăng nhập của bạn" : "Your Login Credentials"}</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>${isVi ? "Mật khẩu tạm thời" : "Temporary Password"}:</strong> <code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
            <p style="color: #dc3545; font-size: 14px;"><strong>${isVi ? "Quan trọng" : "Important"}:</strong> ${isVi ? "Vui lòng thay đổi mật khẩu sau lần đăng nhập đầu tiên để đảm bảo bảo mật." : "Please change your password after your first login for security purposes."}</p>
        </div>
        `
    : "";

  const loginUrl = "https://merchant.botanika.ai";

  const roleMessages = {
    vi: {
      MERCHANT: "Bạn đã được cấp quyền truy cập Merchant vào nền tảng của chúng tôi.",
      SALES: "Bạn đã được cấp quyền truy cập Sales vào nền tảng của chúng tôi.",
      default: "Chào mừng đến với nền tảng của chúng tôi!",
    },
    en: {
      MERCHANT: "You have been granted Merchant access to our platform.",
      SALES: "You have been granted Sales access to our platform.",
      default: "Welcome to our platform!",
    },
  };

  const roleMessage =
    roleMessages[isVi ? "vi" : "en"][role] || roleMessages[isVi ? "vi" : "en"].default;

  const gettingStartedItems = isVi
    ? [
        "Đăng nhập vào tài khoản bằng thông tin đăng nhập ở trên",
        "Hoàn thành thiết lập hồ sơ của bạn",
        "Khám phá bảng điều khiển và các tính năng có sẵn",
        ...(role === "MERCHANT" ? ["Thiết lập cài đặt và tùy chọn merchant"] : []),
        ...(role === "SALES" ? ["Truy cập các công cụ và tài nguyên sales"] : []),
      ]
    : [
        "Log in to your account using the credentials above",
        "Complete your profile setup",
        "Explore the dashboard and available features",
        ...(role === "MERCHANT" ? ["Set up your merchant settings and preferences"] : []),
        ...(role === "SALES" ? ["Access your sales tools and resources"] : []),
      ];

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff7125; margin: 0;">${isVi ? "Chào mừng đến với Botanika!" : "Welcome to Botanika!"}</h1>
                <p style="color: #666; margin: 5px 0;">${isVi ? "Tài khoản của bạn đã được tạo thành công" : "Your account has been successfully created"}</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">${isVi ? "Xin chào" : "Hello"} ${name}!</h2>
                <p style="color: #555; line-height: 1.6;">
                    ${roleMessage} ${isVi ? "Chúng tôi rất vui mừng khi bạn tham gia cộng đồng và mong muốn hỗ trợ hành trình của bạn cùng chúng tôi." : "We're excited to have you join our community and look forward to supporting your journey with us."}
                </p>
            </div>
    
            ${passwordSection}
    
            <div style="margin: 30px 0;">
                <h3 style="color: #333;">${isVi ? "Bắt đầu" : "Getting Started"}</h3>
                <ul style="color: #555; line-height: 1.8;">
                    ${gettingStartedItems.map((item) => `<li>${item}</li>`).join("")}
                </ul>
            </div>
    
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #555; margin-bottom: 15px;">${isVi ? "Vui lòng đăng nhập vào tài khoản của bạn tại:" : "Please login to your account at:"}</p>
                <a href="${loginUrl}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #ff7125; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 10px;">
                    ${isVi ? "Đăng nhập vào tài khoản" : "Login to Your Account"}
                </a>
                <br>
                <a href="${loginUrl}" style="color: #ff7125; text-decoration: none; font-size: 14px;">
                    ${loginUrl}
                </a>
            </div>
    
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #777; font-size: 14px;">
                <p>${isVi ? "Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, vui lòng không ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi." : "If you have any questions or need assistance, please don't hesitate to contact our support team."}</p>
                <p style="margin-bottom: 0;">${isVi ? "Trân trọng," : "Best regards,"}<br><strong>${isVi ? "Đội ngũ Botanika" : "The Botanika Team"}</strong></p>
            </div>
    
            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
                ${isVi ? "Email này được tạo tự động. Vui lòng không trả lời email này." : "This email was automatically generated. Please do not reply to this email."}
            </p>
        </div>
        `;
};

const buildResetPasswordOTPTemplate = ({
  name,
  otp,
  language = "vi",
}: {
  name: string;
  otp: string;
  language?: "vi" | "en";
}) => {
  const isVi = language === "vi";

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff7125; margin: 0;">${isVi ? "Đặt lại mật khẩu" : "Reset Password Request"}</h1>
                <p style="color: #666; margin: 5px 0;">${isVi ? "Yêu cầu đặt lại mật khẩu cho tài khoản Botanika" : "Password reset request for your Botanika account"}</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">${isVi ? "Xin chào" : "Hi"} ${name},</h2>
                <p style="color: #555; line-height: 1.6;">
                    ${isVi ? "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Sử dụng mã OTP sau đây để tiếp tục:" : "We received a request to reset your password. Use the following OTP to proceed:"}
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #fff; border: 2px solid #ff7125; border-radius: 8px; padding: 20px; display: inline-block;">
                    <p style="color: #555; font-size: 14px; margin: 0 0 10px 0;">${isVi ? "Mã OTP của bạn:" : "Your OTP Code:"}</p>
                    <div style="font-size: 32px; font-weight: bold; color: #ff7125; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                </div>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                    <strong>${isVi ? "⚠️ Lưu ý quan trọng:" : "⚠️ Important Note:"}</strong><br>
                    ${isVi ? "Mã OTP này có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này." : "This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email."}
                </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #777; font-size: 14px;">
                <p>${isVi ? "Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi." : "If you need further assistance, please contact our support team."}</p>
                <p style="margin-bottom: 0;">${isVi ? "Trân trọng," : "Best regards,"}<br><strong>${isVi ? "Đội ngũ Botanika" : "The Botanika Team"}</strong></p>
            </div>
            
            <p style="margin-top: 20px; color: #999; font-size: 12px; text-align: center;">
                ${isVi ? "Email này được tạo tự động. Vui lòng không trả lời email này." : "This email was automatically generated. Please do not reply to this message."}
            </p>
        </div>
    `;
};
