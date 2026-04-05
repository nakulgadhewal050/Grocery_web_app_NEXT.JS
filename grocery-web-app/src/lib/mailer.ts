import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",  
 
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    await transporter.sendMail({
        from: `"SnapKart" <${process.env.USER_EMAIL}>`,
        to,
        subject,
        html
    })
}