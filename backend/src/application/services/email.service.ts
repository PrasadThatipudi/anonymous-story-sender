import { GmailClient } from '../../infrastructure/email/gmail.client.ts';

export class EmailService {
  private gmailClient: GmailClient;

  constructor() {
    this.gmailClient = new GmailClient();
  }

  async sendStoryNotification(storyId: string, content: string): Promise<void> {
    try {
      await this.gmailClient.sendNewStoryNotification(storyId, content);
    } catch (error) {
      console.error({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'Email service error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async close(): Promise<void> {
    await this.gmailClient.close();
  }
}

