import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendRecoveryEmail = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '[FOF] 계정 복구 인증 코드',
    html: `<p>아래 인증 코드를 입력해주세요:</p><h2>${code}</h2>`,
  });
};

export const sendPasswordResetEmail = async (email, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '[FOF] 비밀번호 재설정 인증 코드',
    html: `<p>아래 인증 코드를 입력해주세요:</p><h2>${code}</h2>`,
  });
};
