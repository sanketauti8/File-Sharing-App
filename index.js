const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const connectDB=require("./config/db");
connectDB();

//template engine
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs')

app.use(express.json());

const port = process.env.PORT || 5000

 // Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// mongoose
//   .connect(process.env.MONGO_URL)
//   .then((e) => console.log("MongoDB Connected"));


//Routes
app.use('/',require('./routes/home'));
app.use('/api/files',require('./routes/files'));
app.use('/files',require('./routes/show'));
app.use('/files/download',require('./routes/download'))



app.listen(port, () => console.log(`Example app listening on port ${port}!`));