const express = require('express');
const app= express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const commandesRoute = require('./routes/commandes');
const produitRoute = require('./routes/produit');
// Connet to DB 

dotenv.config();
// Import Routes
 
mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true } )

.then(() => console.log('Connecté à la BDD ça c clair'))

.catch((err) => { console.error(err); });

//Middleware

app.use(express.json());


// Route Middlewares

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/commandes', commandesRoute);
app.use('/api/produit', produitRoute);
app.listen(3000, () => console.log('Server Up and running babadji ok?'));