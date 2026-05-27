const transporter = require("../config/emailConfig");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Error sending email:', error);
   }
};

module.exports = sendEmail;