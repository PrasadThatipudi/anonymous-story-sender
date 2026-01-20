import { GmailClient } from '../../infrastructure/email/gmail.client.ts';
import type { ManagerRepository } from '../../infrastructure/database/repositories/manager.repository.ts';

export class EmailService {
  private gmailClient: GmailClient;

  constructor(managerRepository: ManagerRepository) {
    this.gmailClient = new GmailClient(managerRepository);
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

