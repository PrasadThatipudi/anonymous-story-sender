import { SmtpClient } from 'smtp';
import { getEnv, getManagerEmails } from '../../config/env.ts';

export class GmailClient {
  private client: SmtpClient;

  constructor() {
    const env = getEnv();
    
    this.client = new SmtpClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: env.GMAIL_USER,
          password: env.GMAIL_APP_PASSWORD,
        },
      },
    });
  }

  async sendNewStoryNotification(storyId: string, contentPreview: string): Promise<void> {
    const env = getEnv();
    const managerEmails = getManagerEmails();
    const timestamp = new Date().toISOString();

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
        await this.client.send({
          from: env.GMAIL_USER,
          to: recipientEmail,
          subject,
          content: textContent,
          html: htmlContent,
        });

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

  async close(): Promise<void> {
    await this.client.close();
  }
}

