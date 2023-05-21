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
    userId = decodedToken._id;
    const u = User.findOne( { _id : userId});

    if (u.fournisseur) {
        Commande.find({ id_fournisseur: userId })
            .then(commandes => {
                console.log(commandes);
                // Faites quelque chose avec les commandes récupérées
                return res.status(200).json(commandes);
            })
            .catch(err => {
                console.error(err);
                // Gérez l'erreur selon vos besoins
            });
    } 
    else {
        Commande.find({ id_franchise: userId })
            .then(commandes => {

                console.log(commandes);
                return res.status(200).json(commandes);

                // Faites quelque chose avec les commandes récupérées
            })
            .catch(err => {
                console.error(err);
                // Gérez l'erreur selon vos besoins
            });
    }

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

router.put('/commande_traitee/:id_commande', verify, async (req, res) => {
    const token = req.headers['auth-token'];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken._id;
  
    try {
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      if (user.fournisseur) {
        commande = await Commande.findOne({ _id: req.params.id_commande, id_fournisseur: user._id });
      }
      else {
        commande = await Commande.findOne({ _id: req.params.id_commande, id_franchise: user._id });

      }
  
      if (!commande) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
  
      commande.traite = true;
  
      const commandeTraitee = await commande.save();
  
      res.json({ message: 'Commande marquée comme traitée', commande: commandeTraitee });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du traitement de la commande' });
    }
  });

  router.put('/ajout_observation/:id_commande', verify, async (req, res) => {
    const token = req.headers['auth-token'];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken._id;
    
    try {
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      if (user.fournisseur) {
        auteur = user.name + " (Fournisseur)";
        commande = await Commande.findOne({ _id: req.params.id_commande, id_fournisseur: user._id });
      }
      else {
        auteur = user.name + " (Franchisé)";
        commande = await Commande.findOne({ _id: req.params.id_commande, id_franchise: user._id });
      }
  
      if (!commande) {
        return res.status(404).json({ error: 'Commande non trouvée' });
      }
  
      const currentDate = new Date(Date.now());

      // Obtention des composants de la date
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Les mois commencent à partir de 0 (janvier = 0)
      const year = currentDate.getFullYear();
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      
      // Formatage de la date
      const formattedDate = `${day}-${month}-${year} à ${hours}:${minutes}`;
      

      const nouvelleObservation =  { "observation" : req.body.observation, "auteur" : auteur, "date": formattedDate} ;

      if (!commande.observations) {
        console.log("leftanside");
        commande.observations = [];
      } 
      commande.observations.push(nouvelleObservation);

      
  
  
      const commandeAvecObservation = await commande.save();
  
      res.json({ message: 'Observation ajoutée à la commande', commande: commandeAvecObservation });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'observation' });
    }
  });
  
  

module.exports = router;