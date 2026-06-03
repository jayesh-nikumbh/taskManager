const nodemailer = require('nodemailer');
const dns = require('node:dns');
const https = require('node:https');

// Force DNS resolution to prioritize IPv4 over IPv6, resolving Render outbound ENETUNREACH issues.
dns.setDefaultResultOrder('ipv4first');

/**
 * Helper to make a secure HTTPS POST request without external dependencies
 */
const postRequest = (url, headers, data) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: responseBody });
        } else {
          reject(new Error(`HTTP Error ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Sends an email using Brevo HTTP API, Resend HTTP API, or Nodemailer SMTP fallback
 * @param {Object} options - { email, subject, message }
 */
const sendEmail = async (options) => {
  // 1. Try Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    console.log('📨 Sending email via Brevo HTTP API...');
    const senderEmail = process.env.EMAIL_USER || 'support@taskmanager.com';
    await postRequest(
      'https://api.brevo.com/v3/smtp/email',
      {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      {
        sender: {
          name: 'Task Manager Support',
          email: senderEmail,
        },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.message,
      }
    );
    console.log('✅ Email sent successfully via Brevo.');
    return;
  }

  // 2. Try Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    console.log('📨 Sending email via Resend HTTP API...');
    // Note: Resend Free tier requires from address to be 'onboarding@resend.dev' if domain is not verified
    const sender = process.env.RESEND_FROM_EMAIL || 'Task Manager Support <onboarding@resend.dev>';
    await postRequest(
      'https://api.resend.com/emails',
      {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      {
        from: sender,
        to: options.email,
        subject: options.subject,
        html: options.message,
      }
    );
    console.log('✅ Email sent successfully via Resend.');
    return;
  }

  // 3. Fallback to Nodemailer SMTP (works locally, but blocked on Render Free tier)
  console.log('📨 Sending email via Nodemailer SMTP...');
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      'Email configuration missing! Please set BREVO_API_KEY/RESEND_API_KEY for production HTTP delivery, or EMAIL_USER/EMAIL_PASS for local SMTP delivery.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4,                 // Force IPv4 to bypass Render's IPv6 resolution hangs
    connectionTimeout: 5000,   // 5 seconds connection timeout
    greetingTimeout: 5000,     // 5 seconds greeting timeout
    socketTimeout: 8000,       // 8 seconds socket inactivity timeout
  });

  const mailOptions = {
    from: `"Task Manager Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
  console.log('✅ Email sent successfully via Nodemailer SMTP.');
};

module.exports = sendEmail;
