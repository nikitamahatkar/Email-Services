class MockEmailProvider1 {
    async sendEmail(email) {
      console.log(`MockEmailProvider1: Sending email to ${email.to}`);
      // Simulate random failure
      if (Math.random() > 0.5) throw new Error('MockEmailProvider1: Failed to send email');
    }
  }
  
  class MockEmailProvider2 {
    async sendEmail(email) {
      console.log(`MockEmailProvider2: Sending email to ${email.to}`);
      // Simulate random failure
      if (Math.random() > 0.5) throw new Error('MockEmailProvider2: Failed to send email');
    }
  }
  
  class EmailService {
    constructor(providers, retryCount = 3, rateLimit = 1000) {
      this.providers = providers;
      this.retryCount = retryCount;
      this.sentEmails = new Set(); // To ensure idempotency
      this.rateLimit = rateLimit;
      this.lastSentTime = Date.now();
      this.statusTracker = new Map(); // To track status of emails
    }
  
    async sendEmail(email) {
      if (this.sentEmails.has(email.id)) {
        console.log(`Email with ID ${email.id} has already been sent. Skipping.`);
        return; // Idempotency check
      }
  
      for (let i = 0; i < this.providers.length; i++) {
        const provider = this.providers[i];
        try {
          await this.sendWithRetry(provider, email);
          this.sentEmails.add(email.id); // Mark email as sent
          this.statusTracker.set(email.id, 'Sent');
          console.log(`Email sent successfully using provider ${i + 1}`);
          return;
        } catch (error) {
          console.error(`Failed to send email with provider ${i + 1}: ${error}`);
          this.statusTracker.set(email.id, `Failed with provider ${i + 1}`);
          // Switch to the next provider
        }
      }
  
      throw new Error(`All providers failed to send email to ${email.to}`);
    }
  
    async sendWithRetry(provider, email) {
      for (let attempt = 1; attempt <= this.retryCount; attempt++) {
        try {
          await this.rateLimitCheck();
          await provider.sendEmail(email);
          return;
        } catch (error) {
          console.error(`Attempt ${attempt} failed: ${error}`);
          if (attempt < this.retryCount) {
            await this.exponentialBackoff(attempt);
          }
        }
      }
      throw new Error('Retries exhausted');
    }
  
    async rateLimitCheck() {
      const now = Date.now();
      if (now - this.lastSentTime < this.rateLimit) {
        await new Promise((resolve) => setTimeout(resolve, this.rateLimit));
      }
      this.lastSentTime = Date.now();
    }
  
    async exponentialBackoff(attempt) {
      const delay = Math.pow(2, attempt) * 100; // Exponential backoff: 100ms, 200ms, 400ms, etc.
      console.log(`Waiting for ${delay}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  
    getStatus(emailId) {
      return this.statusTracker.get(emailId) || 'Unknown';
    }
  }
  
  // Usage example
  const emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()]);
  
  const email = {
    to: 'example@example.com',
    subject: 'Test Email',
    body: 'This is a test email.',
    id: 'email-unique-id-123',
  };
  
  emailService.sendEmail(email)
    .then(() => console.log('Email process completed'))
    .catch(error => console.error(`Failed to send email: ${error.message}`));
  
  console.log('Email status:', emailService.getStatus(email.id));