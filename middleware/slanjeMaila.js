const nodemailer = require("nodemailer");
require("dotenv").config();

const kreirajRacunIMail = (data) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const message = {
    from: data.from,
    to: data.to,
    subject: data.subject,
    text: data.text,
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      return console.log(error.message);
    } else {
      console.log("Poslano", info.messageId);
    }
  });
};

const posaljiMail = (data) => {
  try {
    kreirajRacunIMail(data);
  } catch (error) {
    console.log(error);
  }
};

module.exports = posaljiMail;
