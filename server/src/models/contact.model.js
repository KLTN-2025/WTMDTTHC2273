const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelContact = new Schema(
    {
        userId: { type: String, require: true },
        name: { type: String, require: true },
        email: { type: String, require: true },
        message: { type: String, require: true },
        status: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('contact', modelContact);
