const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const multer  = require('multer');

const User = require('../models/user');
const Donations = require('../models/donation');
const Fundraising = require('../models/fundraising');

const fs = require('fs')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        console.log(file);
        var filetype = '';
        if(file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if(file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if(file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
	User.find({}, (err, users) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(users);
		}
	});
});

router.post('/register', (req, res) => {
    let userData = req.body
    let user = new User(userData)
    user.save((error, registeredUser) => {
        if (error) {
            console.log(error)
        } else {
            let payload = { subject: registeredUser._id}
            let user_id = registeredUser._id;
            let token = jwt.sign(payload, 'secretKey')
            res.status(200).send({token, user_id})
        }
    })
})

router.post('/login', (req, res) => {
    let userData = req.body
    User.findOne({email: userData.email}, (error, user) => {
        if (error) {
            console.log(error)
        } else {
            if (!user) {
                res.status(401).send('Invalid email')
            } else
            if (user.password !== userData.password) {
                res.status(401).send('Invalid password')
            } else {
                let payload = { subject: user._id}
                let user_id = user._id;
                let userRole = user.userRole;
                let token = jwt.sign(payload, 'secretKey')
                res.status(200).send({token, user_id, userRole})
            }
        }
    })
})

router.post('/create', upload.single('imagePath'), (req, res, next) => {
    let userData = req.body
	console.log(req.file.filename)
    userData.imagePath = 'http://localhost:3000/images/' + req.file.filename 
    let user = new User(userData)
    user.save((error, enteredUser) => {
        if (error) {
            console.log(error)
        } else {
            res.status(200).send(enteredUser)
        }
    })
});

router.get('/:id', function(req, res){
    console.log('Get request for a single user');
    User.findById(req.params.id)
        .exec(function(err, user){
            if (err){
                console.log("Error retrieving user");
            } else {
                res.json(user);
            }
        })
})

router.put('/editpageimage/:id', upload.single('imagePath'), function (req, res){
    var user = {
        firstname: req.body.firstname,
        lastname:  req.body.lastname,
        birthday:  req.body.birthday,
        gender:    req.body.gender,
        upd_date:  new Date(),
        imagePath: 'http://localhost:3000/images/' + req.file.filename
    };
    console.log(req);
    console.log('Update user data with image');
    // delete previous image from server
    User.findById(req.params.id)
    .then(doc => {
        let imgPath = doc.imagePath.split('/')[4]
        console.log('delete image ' + imgPath)
        fs.unlink('./public/images/' + imgPath, function (err) {
            if (err && err.code == 'ENOENT') {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                console.info('image removed');
            }
        }); 
    })
    .catch(err => {
        console.log(err);
    });

    User.findByIdAndUpdate(req.params.id,
        { $set: user },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in User Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.put('/editpagewithoutimage/:id', function (req, res){
    var user = {
        firstname: req.body.firstname,
        lastname:  req.body.lastname,
        birthday:  req.body.birthday,
        gender:    req.body.gender,
        imagePath: req.body.imagePath
    };
    console.log('Update user data without image');
    User.findByIdAndUpdate(req.params.id,
        { $set: user },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in User Update:' + JSON.stringify(err, undefined, 2)); }
        });
});

router.put('/changepass/:id', function (req, res){
    var user = {
        password: req.body.password,
        upd_date: new Date()
    };

    console.log('Update user password');
    User.findByIdAndUpdate(req.params.id,
        { $set: user },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in User Password Update :' + JSON.stringify(err, undefined, 2)); }
        });
});

router.get('/mydonations/:id', function (req, res){
    Donations.find({userid: req.params.id}, function(err, donations) {
        if(err){
            res.send(err);
        }
        else {
            if (!donations) {
                res.send("That user doesnt exist");
            }
            else {
                res.send(donations);
            }
        }
    })
})

router.get('/myfundraisings/:id', function (req, res){
    Fundraising.find({userid: req.params.id}, function(err, fund) {
        if(err){
            res.send(err);
        }
        else {
            if (!fund) {
                res.send("That fund doesnt exist");
            }
            else {
                res.send(fund);
            }
        }
    })
})

router.get("/delete/:id", (req, res)=>{
    console.log(req.params.id);
    // delete image from server
    User.findById(req.params.id)
        .then(doc => {
            let imgPath = doc.imagePath.split('/')[4]
            console.log('delete image ' + imgPath)
            fs.unlink('./public/images/' + imgPath, function (err) {
                if (err && err.code == 'ENOENT') {
                    // file doens't exist
                    console.info("File doesn't exist, won't remove it.");
                } else if (err) {
                    // other errors, e.g. maybe we don't have enough permission
                    console.error("Error occurred while trying to remove file");
                } else {
                    console.info('image removed');
                }
            }); 
        })
        .catch(err => {
            console.log(err);
        });

    User.deleteOne({ _id: req.params.id }, function(err, data) {
        if (!err) {
            console.log(data);
            console.log("member successfully deleted");
            res.status(200).send(data)
        }
        else {
            console.log("error")
        }
    });
});

module.exports = router