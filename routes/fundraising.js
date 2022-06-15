const express = require('express')
const router  = express.Router()
const multer  = require('multer');
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

const Fundraising = require('../models/fundraising')

router.get('/', (req, res) => {
	Fundraising.find({}, (err, fundraisings) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(fundraisings);
		}
	});
});

router.get('/category', (req, res) => {
	Fundraising.find({categoryid: req.query.categoryid}, (err, fundraisings) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(fundraisings);
		}
	});
});

router.post('/create', upload.single('imagePath'), (req, res, next) => {
    let fundraisingData = req.body
	console.log(req.file.filename)
    fundraisingData.imagePath = 'http://localhost:3000/images/' + req.file.filename 
    let fundraising = new Fundraising(fundraisingData)
    fundraising.save((error, enteredFundraising) => {
        if (error) {
            console.log(error)
        } else {
            res.status(200).send(enteredFundraising)
        }
    })
});

router.get('/:id', function(req, res){
	console.log('Get request for a single fundraising');
	Fundraising.findById(req.params.id)
	.exec(function(err, fundraising){
		if (err){
			console.log("Error retrieving fundraising");
		} else {
			res.json(fundraising);
		}
	})
})

router.put('/edit/:id', upload.single('imagePath'), function (req, res){
    var fundraising = {
        title: req.body.title,
        details:  req.body.details,
        categoryid:  req.body.categoryid,
        amount_goal: req.body.amount_goal,
		city: req.body.city,
		card_num: req.body.card_num,
		card_holder: req.body.card_holder,
		upd_date: new Date(),
        imagePath: 'http://localhost:3000/images/' + req.file.filename
    };
    console.log(req.file.filename)
    console.log('Update fundraising data');
    // delete previous image from server
    Fundraising.findById(req.params.id)
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

    Fundraising.findByIdAndUpdate(req.params.id,
        { $set: fundraising },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Fundraising Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get("/delete/:id", (req, res)=>{
    console.log(req.params.id);
    // delete image from server
    Fundraising.findById(req.params.id)
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

    Fundraising.deleteOne({ _id: req.params.id }, function(err, data) {
        if (!err) {
            console.log(data);
            console.log("fundraising successfully deleted");
            res.status(200).send(data)
        }
        else {
            console.log("error")
        }
    });
});

router.put('/activate/:id', function (req, res){
	console.log("active " + req.body.active)
	var fundraising = {
		active: req.body.active,
		upd_date: new Date(),
	}

	console.log('De/Activate fundraising data');
    Fundraising.findByIdAndUpdate(req.params.id,
        { $set: fundraising },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Fundraising Activate :' + JSON.stringify(err, undefined, 2)); }
    });
});

module.exports = router