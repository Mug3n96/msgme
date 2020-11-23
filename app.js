const express = require("express");
const cors = require("cors");
const sanitizeHtml = require("sanitize-html");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();

const {
  PORT = 5000,
  MAIL,
  MAIL_PW,
  SMTP_HOST,
  SMTP_PORT,
  MAILBOX,
} = process.env;

const corsOptions = {
  origin: "http://127.0.0.1:3030",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/", (req, res) => {
  const { name = null, email = null, message = null } = req.body;

  const payload = {
    name,
    email,
    message,
  };

  //:TODO if smth null send error

  for (const key in payload) {
    payload[key] = sanitizeHtml(payload[key], sanitizeOptions);
  }

  // pass payload to nodemailer and send mail
  sendMail(payload);
});

app.listen(PORT, () => {
  console.log(`Process running on Port ${PORT}`);
});

async function sendMail(payload) {
  // email subject
  const subject = `msgme Message from <${payload.email}>`;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: MAIL, // mail
      pass: MAIL_PW, // email password
    },
  });

  const mail = {
    from: `"Heinrich Root" <${MAIL}>`, // sender address
    to: MAILBOX, // list of receivers
    subject, // Subject line
    text: payload.message, // plain text body
    html: "<b>Hello world?</b>", // html body
  };

  console.log(mail);

  try {
    // send mail with defined transport object
    let info = await transporter.sendMail(mail);

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (e) {
    console.error(e);
  }
}
