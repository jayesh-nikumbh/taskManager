const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer
 * @param {Object} options - { email, subject, message }
 */
const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
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
