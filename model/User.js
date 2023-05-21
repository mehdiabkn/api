const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: 
    {
        type: String,
        unique: true,
        required: true,
        max: 25,
        min:6
    },
    password: 
    {
        type: String,
        required: true,
        max: 1025,
        min: 6
    },
    date: 
    {
        type: Date,
        default: Date.now
    },
    fournisseur: {
        type: Boolean,
        required: true,
        default: true
    },
    id_fournisseur: {
        type : String,
        default: ""
    }
});

module.exports= mongoose.model('User', userSchema);