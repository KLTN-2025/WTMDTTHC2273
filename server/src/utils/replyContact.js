const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const mailReplyContact = async (email, messager) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        await transport.sendMail({
            from: `"5s Fashion" <${process.env.USER_EMAIL}>`,
            to: email,
            subject: 'Phản hồi liên hệ - 5s Fashion',
            text: `Cảm ơn bạn đã liên hệ với 5s Fashion. Chúng tôi đã nhận được tin nhắn của bạn: "${messager}". Chúng tôi sẽ phản hồi sớm nhất có thể.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #e67e22;">5s Fashion</h2>
                        <p style="color: #555; font-size: 14px;">Phản hồi liên hệ</p>
                    </div>
                    <p>Xin chào <strong>${email}</strong>,</p>
                    <p>Cảm ơn bạn đã liên hệ với 5s Fashion. Chúng tôi đã nhận được tin nhắn của bạn:</p>
                    <p style="padding: 15px; background-color: #fff; border-left: 4px solid #e67e22; margin: 10px 0;">
                        "${messager}"
                    </p>
                    <p>Chúng tôi sẽ xem xét và phản hồi lại bạn trong thời gian sớm nhất.</p>
                    <p>Nếu bạn có bất kỳ câu hỏi nào khác, vui lòng liên hệ với chúng tôi qua email <a href="mailto:${process.env.USER_EMAIL}" style="color: #3498db; text-decoration: none;">${process.env.USER_EMAIL}</a>.</p>
                    <p style="margin-top: 20px; font-size: 14px; text-align: center; color: #777;">Trân trọng,</p>
                    <p style="text-align: center; color: #e67e22; font-size: 18px;">Đội ngũ 5s Fashion</p>
                </div>
            `,
        });
    } catch (error) {
        console.log('Lỗi khi gửi email:', error);
    }
};

module.exports = mailReplyContact;
