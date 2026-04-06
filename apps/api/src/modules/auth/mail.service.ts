import type { MailService } from './mail.types.js';

// Development implementation — logs to console, never sends real email.
// Replace with a real provider (Resend, SendGrid, Nodemailer, etc.) by implementing
// the MailService interface and swapping this export in auth.resolver.ts.
export const devMailService: MailService = {
  async sendPasswordResetEmail({ to, resetLink }) {
    console.log('[mail:dev] Password reset email');
    console.log(`  to:   ${to}`);
    console.log(`  link: ${resetLink}`);
  },
};
