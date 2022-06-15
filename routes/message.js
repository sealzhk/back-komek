const express = require('express')
const router  = express.Router()

const Message = require('../models/message')

router.post('/send', (req, res) => {
    let messageData = req.body
    let message = new Message(messageData)
    console.log('send message to ' + messageData.to)
    message.save((error, enteredMessage) => {
        if (error) {
            console.log(error)
        } else {
            res.status(200).send(enteredMessage)
        }
    })
})

router.get('/user', (req, res) => {
	console.log("get messages by user id: " + req.query.id);
	Message.find({to: req.query.id}, (err, messages) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.json(messages);
		}
	});
});

module.exports = router
