const router = require('express').Router();
const verify = require('./verifyToken');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../model/User');
const Commande = require('../model/Commande');

dotenv.config();

router.get('/',verify, (req, res) => {
    const token = req.headers['auth-token']; // Remplacez 'auth-token' par le nom réel de l'en-tête
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // Remplacez 'votre_clé_secrète' par votre clé de signature JWT

    const u = User.findOne( { _id : decodedToken._id});

    u.then((user) => {
        if (user) {
          const userName = user.name;
          const userEmail = user.email;
          const date=  user.date;
          const est_fournisseur= user.fournisseur;
          console.log(userName);
          res.json({ name: userName,
                    email: userEmail,
                    est_fournisseur: est_fournisseur,
                    membre_depuis: date });

          // Faites quelque chose avec le nom de l'utilisateur
        } else {
            res.status(400).json({ error: "Non trouvé" });
          // Gérez le cas où l'utilisateur n'est pas trouvé
        }
      })
      .catch((err) => {
        console.error(err);
        // Gérez l'erreur selon vos besoins
      });

}); 

router.post('/create_commande', verify, async (req, res) => {
    
    const token = req.headers['auth-token']; // Remplacez 'auth-token' par le nom réel de l'en-tête
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // Remplacez 'votre_clé_secrète' par votre clé de signature JWT
    
    const produitFields = [];

    for (const key in req.body) {
      if (key.startsWith("idproduit_")) {
        const idKey = key;
        const quantityKey = `quantiteproduit${key.substring(9)}`;
        console.log(req.body[key]);
        console.log(req.body[quantityKey]);
        if (req.body.hasOwnProperty(quantityKey)) {
          const produitField = {
            idproduit: req.body[idKey],
            quantiteproduit: req.body[quantityKey]
          };
    
          produitFields.push(produitField);
        }
      }
      console.log(produitFields);
    }
    


    
    const userId = decodedToken.userId;
    const u = User.findOne( { id : userId});



    u.then(async (user) => { // Si on trouve le user du findOne alors : 
        if (user) {
            const coms = new Commande({
                id_fournisseur: user.id_fournisseur,
                id_franchise: user._id,
                liste_produits: produitFields,
            });
            try{
                
                const com= await coms.save();
                console.log(com.liste_produits[0]);
                condition = {};
                res.send({
                    commande: com._id,   
                });
            } catch(err) {
                res.status(400).send(err);
            }
          // Faites quelque chose avec le nom de l'utilisateur
        } else {
            res.status(400).json({ error: "Non trouvé" });
          // Gérez le cas où l'utilisateur n'est pas trouvé
        }
      })
      .catch((err) => {
        console.error(err);
        // Gérez l'erreur selon vos besoins
      });

    
}
);

module.exports = router;