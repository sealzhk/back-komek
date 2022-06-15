const express    = require('express')
const bodyParser = require('body-parser')
const cors       = require('cors')
const path       = require('path')
const mongoose   = require('mongoose');

const profilesRoutes    = require('./routes/profiles')
const categoryRoutes    = require('./routes/category')
const fundraisingRoutes = require('./routes/fundraising')
const donationRoutes    = require('./routes/donation')
const messageRoutes     = require('./routes/message')

const PORT = 3000

const app  = express()

mongoose.connect("mongodb+srv://admin:diploma2022@cluster0.xwhi0.mongodb.net/komek?retryWrites=true&w=majority",
                 {useNewUrlParser: true, useUnifiedTopology: true}   
        )
        .then(() => {
            app.listen(PORT, console.log("Server is running on port", PORT));
        })
        .catch((err) => console.log('Could not connect to database server', err));

app.use(bodyParser.urlencoded({ extended: false }))        
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/profiles',    profilesRoutes)
app.use('/category',    categoryRoutes)
app.use('/fundraising', fundraisingRoutes)
app.use('/donation',    donationRoutes)
app.use('/message',     messageRoutes)

module.exports = app;