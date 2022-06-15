const mongoose = require('mongoose')

const Schema = mongoose.Schema
const messageSchema = new Schema({
    from:       String,
    to:         String,
    from_email: String,
    to_email:   String,
    sender:     String,
    receiver:   String,
    message:    String,
    date:     { type: Date, default: Date.now },
})
module.exports = mongoose.model('message', messageSchema, 'messages')