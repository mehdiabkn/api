const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema(
{
    id_franchise:
     {
        type: String,
        required: true,
    },
    id_fournisseur: 
    {
        type: String,
        required: true,    
    },
    liste_produits: 
    {
        type: Array,
        default: []
    },
    prix: 
    {
        type: Number,
        default: 0,
    },
    traite:
    {
        type: Boolean,
        default: false
    },
    observations:
    {
        type: Array,
        default: []
    }
});

module.exports= mongoose.model('Commande', commandeSchema);