const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
{
    id_fournisseur:
     {
        type: String,
        required: true,
    },
    url_image_produit: 
    {
        type: String,
        required: true,    
    },
    nom_produit:
     {
        type: String,
        required: true,
    },
    prix: 
    {
        type: Number,
        default: 0,
    },
    date: 
    {
        type: Date,
        default: Date.now
    },
});

module.exports= mongoose.model('Produit', produitSchema);
