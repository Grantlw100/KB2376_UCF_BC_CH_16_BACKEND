const express = require('express');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(helmet());

const corsOptions = {
  origin: process.env.URL, 
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

app.use(express.static('public'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
});
app.use(limiter);

app.use(express.json());

const transport = nodemailer.createTransport({
  service: 'outlook', 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, 
  },
});

app.post('/send-email', (req, res) => {
  const { subject, message, replyTo } = req.body; 
  
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.RECEPTION,
    subject: subject,
    text: `${message}\n\nReply to: ${replyTo}`
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Error sending email.' });
    }
    res.status(200).json({ message: 'Email sent successfully!' });
  });
});


app.get('/download-resume', (req, res) => {
  const file = `${__dirname}/public/resume.doc`;
  res.download(file, 'resume.doc', (err) => {
    if (err) {
      console.error('Download Error:', err);
      res.status(500).send("Error occurred while downloading the resume");
    }
  });
});



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
