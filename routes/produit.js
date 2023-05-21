const router = require('express').Router();
const verify = require('./verifyToken');

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');

const User = require('../model/User');
const Produit = require('../model/Produit');


dotenv.config();

router.get('/',verify, (req, res) => {
    const token = req.headers['auth-token']; // Remplacez 'auth-token' par le nom réel de l'en-tête
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // Remplacez 'votre_clé_secrète' par votre clé de signature JWT
    userId = decodedToken._id;
    const u = User.findOne( { _id : userId});

    if (u.fournisseur) {
        Produit.find({ id_fournisseur: userId })
            .then(produits => {
                console.log(produits);
                // Faites quelque chose avec les  récupérées
                return res.status(200).json(produits);
            })
            .catch(err => {
                console.error(err);
                // Gérez l'erreur selon vos besoins
            });
    } 
    else {
        Produit.find({ id_fournisseur: u.id_fournisseur })
            .then(produits => {
                console.log(produits);
                return res.status(200).json(produits);
                // Faites quelque chose avec les  récupérées
            })
            .catch(err => {
                console.error(err);
                // Gérez l'erreur selon vos besoins
            });
    }
    

}); 

 // Définir le stockage pour les fichiers téléchargés
 const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'images_produit/'); // Répertoire de destination des fichiers téléchargés
    },
    filename: function (req, file, cb) {
    // Générer un nom de fichier unique en ajoutant un horodatage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
    },
});

// Configurer Multer
const upload = multer({ storage });



router.post('/ajout_produit', verify,  upload.single('image'), async (req, res) => {
    
    const token = req.headers['auth-token']; // Remplacez 'auth-token' par le nom réel de l'en-tête
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET); // Remplacez 'votre_clé_secrète' par votre clé de signature JWT
    const userId = decodedToken.userId;
    const u = User.findOne( { id : userId});


   


    u.then(async (user) => { // Si on trouve le user du findOne alors : 
        if (user) {
            id_fournisseur="0";
            if (user.fournisseur) {
                id_fournisseur = user._id;
            }
            else {
                id_fournisseur = user.id_fournisseur;
            }
            const pr = new Produit({
                nom_produit: req.body.nom,
                id_fournisseur:  id_fournisseur,
                prix: req.body.prix,
                url_image_produit: req.file ? req.file.path : "rien pour l'instant",
            });
            try{
                const produit= await pr.save();
                console.log
                return res.send({
                    produit: produit._id,   
                });
            } catch(err) {
                console.log(err);
                res.status(400).send(err);
            }
          // Faites quelque chose avec le nom de l'utilisateur
        } else {
            res.status(400).json({ error: "Utilisateur non trouvé" });
          // Gérez le cas où l'utilisateur n'est pas trouvé
        }
      })
      .catch((err) => {
        console.error(err);
        // Gérez l'erreur selon vos besoins
      });

    
}
);



router.delete('/delete_produit/:id', verify, async (req, res) => {
    const token = req.headers['auth-token'];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    
    const user = await User.findOne({ id: userId });
  
    if (user) {
      const id_fournisseur = user.fournisseur ? user._id : user.id_fournisseur;
      
      try {
        const produit = await Produit.findOneAndDelete({ _id: req.params.id, id_fournisseur });
        
        if (produit) {
          res.send({ message: 'Produit supprimé avec succès' });
        } else {
          res.status(404).json({ error: 'Produit non trouvé' });
        }
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
      }
    } else {
      res.status(400).json({ error: 'Utilisateur non trouvé' });
    }
  });
  
  
router.put('/modifier_produit/:id', verify, async (req, res) => {
  const token = req.headers['auth-token'];
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const userId = decodedToken.userId;

  const user = await User.findOne({ id: userId });

  if (user) {
    const id_fournisseur = user.fournisseur ? user._id : res.status(400).send('Impossible de changer le produit, réservé au fournisseur');

    try {
      const produit = await Produit.findOneAndUpdate(
        { _id: req.params.id, id_fournisseur },
        {
          $set: {
            nom_produit: req.body.nom,
            prix: req.body.prix,
            url_image_produit: "url image pour l'instant",
          },
        },
        { new: true }
      );

      if (produit) {
        res.json({ message: 'Produit modifié avec succès', produit });
      } else {
        res.status(404).json({ error: 'Produit non trouvé' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la modification du produit' });
    }
  } else {
    res.status(400).json({ error: 'Utilisateur non trouvé' });
  }
});


  
  

module.exports = router;