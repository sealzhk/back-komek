const express = require('express')
const router  = express.Router()

const Donation = require('../models/donation')
const Donations = require("../models/donation");

router.post('/donate', (req, res) => {
    let donationData = req.body
    let donation = new Donation(donationData)
    donation.save((error, enteredDonation) => {
        if (error) {
            console.log(error)
        } else {
            res.status(200).send(enteredDonation)
        }
    })
})

router.put('/edit/:id', function (req, res){
    var donation = {
        total: 0,
        donation:  0,
        tip:  0,
		upd_date: new Date()
    };
    console.log('Update donation data');

    Donation.findByIdAndUpdate(req.params.id,
        { $set: donation },
        { new: true },
        (err, doc) => {
            if (!err) { res.send(doc); }
            else { console.log('Error in Donation Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.get('/', (req, res) => {
	Donation.find({}, (err, donations) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(donations);
		}
	});
});

router.get('/fundraising', (req, res) => {
	console.log("get donation by fundraising id: " + req.query.fundraisingid);
	Donation.find({fundraisingid: req.query.fundraisingid}, (err, donations) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(donations);
		}
	});
});

router.get('/user', (req, res) => {
	console.log("get donation by user id: " + req.query.userid);
	Donation.find({userid: req.query.userid}, (err, donations) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(donations);
		}
	});
});

router.get('/:id', function(req, res){
	console.log('Get request for a single donation: ' + req.params.id);
	Donation.findById(req.params.id)
	.exec(function(err, donation){
		if (err){
			console.log("Error retrieving donation");
		} else {
			res.json(donation);
		}
	})
})

module.exports = router
