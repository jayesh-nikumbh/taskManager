const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer
 * @param {Object} options - { email, subject, message }
 */
const sendEmail = async (options) => {
  // Create a transporter with timeouts to prevent the request from hanging
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,   // 5 seconds connection timeout
    greetingTimeout: 5000,     // 5 seconds greeting timeout
    socketTimeout: 8000,       // 8 seconds socket inactivity timeout
  });

  // Define email options
  const mailOptions = {
    from: `"Task Manager Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
