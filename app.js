import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import encrypt from 'mongoose-encryption';
import crypto from 'crypto';

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/userDB');

let userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

let User = mongoose.model('user', userSchema);

//for generating encrypting codes for your secret keys
// crypto.randomBytes(64, (err, buffer) => {
//     let key = buffer;
//     console.log(key.toString());
// })

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/register', async(req, res) => {

    let isRegistered = await User.findOne({ email: req.body.username });

    let newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    
    if (isRegistered == null) {
        newUser.save( (err) => {
            if(!err) {
                res.render('secrets'); 
            }
        });
    } else {
        res.redirect('/register');
    };

});

app.post('/login', async(req, res) => {
    
    let registeredEmail = req.body.username;
    let registeredPw = req.body.password;
    let foundUser = await User.findOne({email: registeredEmail});

    if (foundUser != null) {
        if (foundUser.password === registeredPw) {
            res.render('secrets');
        } else {
            res.redirect('login');
        }
    } else {
        res.redirect('login');
    }
});

app.listen(3001, () => {
    console.log('server started on 3001.');
});

