const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');

// VALIDATION 
router.post('/register', async (req, res) => {

    // CHECKING IF THE USER IS ALREADY IN THE DATABASE 
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).send('Cet email est déjà utilisé');
    const nomValide = req.body.name.length >= 4 && req.body.name.length <= 255
    const mailValide = /\S+@\S+\.\S+/.test(req.body.email)
    && req.body.email.length >= 6 && req.body.email.length <= 150

    const password = req.body.password;
    const hasMinLength = password.length >= 6;
    const hasDigit = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const isValidPassword = hasMinLength && hasDigit && hasLetter && hasSpecialChar;

    ///  HASH THE PASSWORD

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user

    if (!nomValide) {
        res.status(400).json({ error: "Le nom doit faire entre 4 et 255 caractères" });
    }
    else if (!mailValide) {
        res.status(400).json({ error: "Format du mail invalide" });
    }
    else if (!isValidPassword)  {
        res.status(400).json({ error: "Le mot de passe doit faire au moins 6 caractères et doit contenir au moins un chiffre et une lettre et un caractère spécial (parmi !@#$%^&*) " });
    }
    else {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        try{
    
            const savedUser= await user.save();
            res.send({
                user: user._id,
            });
        } catch(err) {
            res.status(400).send(error);
        }
    }



});


// LOGIN 
router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send('Cet email n\'est pas reconnu');
    }
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) {
        return res.status(400).send('Mot de passe invalide');
    }
    // Create and assign a token 
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
    
});


module.exports = router;

//Bjp13VXuhgk6iNkl