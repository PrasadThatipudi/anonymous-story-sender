import nodemailer from 'nodemailer';
import { getEnv, getManagerEmails } from '../../config/env.ts';

export class GmailClient {
  private transporter: any;

  constructor() {
    const env = getEnv();
    
    console.log('🔥 GmailClient constructor entry - using NODEMAILER');
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });

    console.log('🔥 Transporter created');
  }

  async sendNewStoryNotification(storyId: string, contentPreview: string): Promise<void> {
    const env = getEnv();
    const managerEmails = getManagerEmails();
    const timestamp = new Date().toISOString();

    console.log('🔥 sendNewStoryNotification entry');

    const subject = '📖 New Anonymous Story Submitted';
    const preview = contentPreview.substring(0, 200) + (contentPreview.length > 200 ? '...' : '');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .preview-box {
      background: white;
      padding: 20px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
    }
    .meta {
      color: #6b7280;
      font-size: 14px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">📖 New Story Received</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Anonymous Story Submission Platform</p>
  </div>
  
  <div class="content">
    <p>Hello Manager,</p>
    <p>A new anonymous story has been submitted to your platform.</p>
    
    <div class="preview-box">
      <strong>Story Preview:</strong>
      <p style="margin: 10px 0; color: #374151;">${this.escapeHtml(preview)}</p>
    </div>
    
    <div class="meta">
      <strong>Story ID:</strong> ${storyId}<br>
      <strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}<br>
      <strong>Status:</strong> NEW
    </div>
    
    <p>Log in to your manager dashboard to view the full story and take action.</p>
    
    <div style="text-align: center;">
      <a href="${env.CORS_ORIGINS.split(',')[1] || 'http://localhost:5174'}" class="button">
        View Dashboard
      </a>
    </div>
  </div>
  
  <div class="footer">
    <p>This is an automated notification from your Anonymous Story Platform.</p>
    <p>Story content is never included in email logs for privacy protection.</p>
  </div>
</body>
</html>
    `;

    const textContent = `
New Anonymous Story Submitted

A new anonymous story has been submitted to your platform.

Story Preview:
${preview}

Story ID: ${storyId}
Submitted: ${new Date(timestamp).toLocaleString()}
Status: NEW

Log in to your manager dashboard to view the full story and take action.

---
This is an automated notification from your Anonymous Story Platform.
Story content is never included in email logs for privacy protection.
    `;

    try {
      for (const recipientEmail of managerEmails) {
        console.log('🔥 About to call transporter.sendMail');

        await this.transporter.sendMail({
          from: env.GMAIL_USER,
          to: recipientEmail,
          subject: subject,
          text: textContent,
          html: htmlContent,
        });

        console.log('🔥 Email sent successfully');

        console.log({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'Story notification email sent',
          context: {
            storyId,
            recipient: this.maskEmail(recipientEmail),
          },
        });
      }
    } catch (error) {
      console.error('🔥 Email send error caught:', error);

      console.error({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'Failed to send email notification',
        error: error instanceof Error ? error.message : 'Unknown error',
        context: {
          storyId,
        },
      });
      throw error;
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
      return `***@${domain}`;
    }
    return `${localPart.substring(0, 3)}***@${domain}`;
  }

  async sendInvitation(
    recipientEmail: string,
    inviterEmail: string,
    role: string,
    token: string
  ): Promise<void> {
    const env = getEnv();
    const invitationLink = `${env.FRONTEND_MANAGER_URL}/accept-invitation?token=${token}`;
    const roleDisplay = role === 'ADMIN' ? 'Admin' : 'Manager';

    const subject = `You've been invited to join Story Manager as ${roleDisplay}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
    }
    .info-box {
      background: white;
      padding: 20px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 14px 40px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: 600;
      font-size: 16px;
    }
    .role-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🎉 You're Invited!</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Story Manager Platform</p>
  </div>
  
  <div class="content">
    <p>Hello,</p>
    <p><strong>${this.escapeHtml(inviterEmail)}</strong> has invited you to join the Story Manager platform.</p>
    
    <div class="info-box">
      <p style="margin: 0;"><strong>Your Role:</strong> <span class="role-badge">${roleDisplay}</span></p>
      <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
        ${role === 'ADMIN' 
          ? 'As an Admin, you will have full access to view, manage, and export stories, as well as invite other managers.' 
          : 'As a Manager, you will be able to view stories and add notes.'}
      </p>
    </div>
    
    <p>Click the button below to accept the invitation and set your password:</p>
    
    <div style="text-align: center;">
      <a href="${invitationLink}" class="button">
        Accept Invitation
      </a>
    </div>
    
    <div class="warning">
      <strong>⏰ Important:</strong> This invitation expires in 48 hours.
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${invitationLink}" style="color: #667eea; word-break: break-all;">${invitationLink}</a>
    </p>
  </div>
  
  <div class="footer">
    <p>This invitation was sent to ${this.escapeHtml(recipientEmail)}</p>
    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
  </div>
</body>
</html>
    `;

    const textContent = `
You're Invited to Story Manager!

${inviterEmail} has invited you to join the Story Manager platform as ${roleDisplay}.

${role === 'ADMIN' 
  ? 'As an Admin, you will have full access to view, manage, and export stories, as well as invite other managers.' 
  : 'As a Manager, you will be able to view stories and add notes.'}

Click the link below to accept the invitation and set your password:
${invitationLink}

IMPORTANT: This invitation expires in 48 hours.

---
This invitation was sent to ${recipientEmail}
If you didn't expect this invitation, you can safely ignore this email.
    `;

    try {
      await this.transporter.sendMail({
        from: env.GMAIL_USER,
        to: recipientEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Invitation email sent',
        context: {
          recipient: this.maskEmail(recipientEmail),
          inviter: this.maskEmail(inviterEmail),
          role,
        },
      });
    } catch (error) {
      console.error({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'Failed to send invitation email',
        error: error instanceof Error ? error.message : 'Unknown error',
        context: {
          recipient: this.maskEmail(recipientEmail),
        },
      });
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.transporter.close();
  }
}
