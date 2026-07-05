const sendVerificationEmail = async (email, name, token) => {
  const brevoKey = process.env.BREVO_API_KEY;
  if (!brevoKey) {
    console.error('BREVO_API_KEY is not defined in environment variables.');
    return false;
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const senderEmail = process.env.SENDER_EMAIL || 'bytesofthq@gmail.com';
  const senderName = process.env.SENDER_NAME || 'Salah Directory';

  const body = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [
      {
        email: email,
        name: name
      }
    ],
    subject: "Verify Your Email - Salah Directory",
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 24px; font-weight: bold; color: #0f766e;">Salah Directory</span>
            </div>
            <h2 style="color: #0f766e; text-align: center; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p>Assalamu Alaikum <strong>${name}</strong>,</p>
            <p>Thank you for registering your mosque on Salah Directory. To complete your administrator registration and activate your account, please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${verificationLink}" style="background-color: #0f766e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px rgba(15, 118, 110, 0.15);">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0f766e; font-size: 13px; font-family: monospace; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #f1f5f9;">${verificationLink}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This link will expire in 24 hours. If you did not register for Salah Directory, please ignore this email.</p>
          </div>
        </body>
      </html>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`Verification email sent to ${email} successfully. Message ID: ${data.messageId}`);
      return true;
    } else {
      console.error('Brevo API Error:', data);
      return false;
    }
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail
};
