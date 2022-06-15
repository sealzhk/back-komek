const mongoose = require('mongoose')

const Schema = mongoose.Schema
const categorySchema = new Schema({
    name:       String,
    details:    String,
    imagePath:  String,
    active:   { type: Boolean, default: true },
    date:     { type: Date, default: Date.now },
    upd_date: { type: Date, default: Date.now }
})
module.exports = mongoose.model('category', categorySchema, 'categories')