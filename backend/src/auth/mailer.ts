import nodemailer from 'nodemailer';

type MailOpts = { to: string; subject: string; text: string };

function getSmtpConfig() {
  const host = (process.env.SMTP_HOST ?? '').trim();
  const portRaw = (process.env.SMTP_PORT ?? '').trim();
  const user = (process.env.SMTP_USER ?? '').trim();
  const pass = (process.env.SMTP_PASS ?? '').trim();
  const from = (process.env.SMTP_FROM ?? '').trim();

  const port = portRaw ? Number.parseInt(portRaw, 10) : NaN;
  if (!host || !Number.isFinite(port) || !from) return null;

  return { host, port, user, pass, from };
}

export async function sendMail(opts: MailOpts) {
  const cfg = getSmtpConfig();
  if (!cfg) return { sent: false as const, reason: 'SMTP not configured' as const };

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
  });

  await transporter.sendMail({
    from: cfg.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  });

  return { sent: true as const };
}

