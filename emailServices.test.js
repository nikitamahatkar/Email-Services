const EmailService = require('./emailService');

class MockEmailProvider {
    constructor(successRate) {
        this.successRate = successRate;
    }

    async sendEmail() {
        if (Math.random() > this.successRate) throw new Error('Failed to send email');
    }
}

describe('EmailService', () => {
    const email = { id: 'test-id', to: 'test@example.com', subject: 'Test', body: 'This is a test' };
    let emailService;

    test('sends email with fallback', async () => {
        emailService = new EmailService([new MockEmailProvider(0), new MockEmailProvider(1)]);
        await emailService.sendEmail(email);
        expect(emailService.getStatus(email.id)).toBe('Sent');
    });

    test('retries and eventually succeeds', async () => {
        emailService = new EmailService([new MockEmailProvider(0.5)]);
        await emailService.sendEmail(email);
        expect(emailService.getStatus(email.id)).toBe('Sent');
    });

    test('throws error if all providers fail', async () => {
        emailService = new EmailService([new MockEmailProvider(0), new MockEmailProvider(0)]);
        await expect(emailService.sendEmail(email)).rejects.toThrow('All providers failed');
        expect(emailService.getStatus(email.id)).toBe('Failed');
    });

    test('prevents duplicate sends (idempotency)', async () => {
        emailService = new EmailService([new MockEmailProvider(1)]);
        await emailService.sendEmail(email);
        await emailService.sendEmail(email);
        expect(emailService.getStatus(email.id)).toBe('Sent');
    });
});