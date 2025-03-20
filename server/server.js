const express = require('express');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const session = require('cookie-session');
const fundPost = require('./routes/fundPost.route');
const event = require('./routes/event.route');
const user = require('./routes/user.route');
const auth = require('./routes/auth.route');
const feed = require('./routes/feed.route');
const donation = require('./routes/donation.route');
const passportSetup = require('./config/passportSetup');
const cookieParser = require('cookie-parser');
const cookieAuth = require('./middlewares/cookieAuth');
const closeEventSchedular = require('./cronjobs/closeEventScheduler');
const closeFundSchedular = require('./cronjobs/closeFundSchedular');
const sendEmail = require('./services/email');
const multer = require('multer');
const app = express();
// const generatePDF = require('./services/generatePDF');
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors({
    credentials:true,
    origin:["http://localhost:3000","https://blossom-web-v1.vercel.app"]
}));
app.use(session({
    name:'blossom-ck-session',
    secret:process.env.EXPRESS_SESSION_SECRET,
    maxAge: 24*60*60*1000
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'/public')));

// server routes
app.use('/auth',auth);
// app.use(cookieAuth);
app.use('/funds',fundPost);
app.use('/events',event);
app.use('/user',user);
app.use('/feeds',feed);
app.use('/donations',donation);

app.get('/', (req,res)=>  {
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'view','welcome.html'));
    }
} );

// Set up storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  // Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    }
  }).single('image');
  // Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
  // Route to handle file upload
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        if (req.file == undefined) {
          res.status(400).json({ message: 'No file selected' });
        } else {
          res.status(200).json({ message: 'File uploaded', filePath: `/uploads/${req.file.filename}` });
        }
      }
    });
  });
const connectToDB = async()=>{
    try {
           await mongoose.connect(process.env.MONGO_DB_URI);
           console.log(`MongoDB is connected successfully`);
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
connectToDB();

app.listen(PORT, 
    console.log(`Server is running on ${PORT}`));