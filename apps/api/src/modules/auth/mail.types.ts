export interface SendPasswordResetEmailParams {
  to: string;
  resetLink: string;
}

// Extend with additional mail operations as features grow (e.g. welcome email, invite)
export interface MailService {
  sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<void>;
}
