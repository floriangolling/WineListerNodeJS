let bodyParser = require('body-parser');
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let session = require('express-session');
let cookieParser = require('cookie-parser');
let flash = require('express-flash');
let express = require('express')
const {Vine, User, Stage} = require('../models')
let router = express.Router();

router.get('/', (req, res, next) => {
    console.log('GET ACCUEIL');
    if (!req.session.email) {
        res.redirect('/login');
        req.flash('info','Veuillez vous connecter');
    }
    else {
        req.flash('Co','Se déconnecter');
        res.render('accueil');
    }
});

router.get('/vins', async function(req, res) {
    console.log('VINE GET');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
            const vine = await Vine.findAll({ where: { username: req.session.email }, order: [
            ['id', 'ASC'],
            ]});
        if (vine == null)
            res.redirect('/add');
        else {
            console.log('les vins sont bien trouvés');
            req.flash('Co','Se déconnecter');
            res.render('vins', {Vines: vine});
        }
    }
});

router.get('/stage', async function(req, res) {
    console.log('STAGE GET');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        const sta = await Stage.findAll({ where: { username: req.session.email }});
        if (sta == null)
            res.redirect('/addstage');
        else {
            req.flash('Co','Se déconnecter');
            res.render('stage', {Stages: sta});
        }
    }
});

router.post('/add', async function(req, res) {
    console.log('ADD');
    console.log(req.body);
    if (!req.session.email)
        res.redirect('/');
    else {
        await Vine.create({ username: req.session.email, Quantity: req.body.quantity, Description: req.body.description, Name: req.body.name });
        console.log('vin bien rajouté');
        res.redirect('/vins');
    }
});

router.post('/addstage', async function(req, res) {
    console.log('ADD STAGE');
    console.log(req.body);
    if (!req.session.email)
        res.redirect('/');
    else {
        await Stage.create({ username: req.session.email, Week: req.body.week, Description: req.body.description});
        console.log('vin bien rajouté');
        res.redirect('/stage');
    }
});

router.post('/add2/:name/:description/:quantity', async function(req, res) {
    console.log('ADD');
    if (!req.session.email)
        res.redirect('/');
    else {
        let newvine = await Vine.create({ username: req.session.email, Quantity: req.params.quantity, Description: req.params.description, Name: req.params.name });
        console.log('vin bien rajouté');
        res.send(newvine);
    }
});

router.put('/minus/:id', async function(req, res) {
    console.log('MINUS');
    if (!req.session.email)
        res.redirect('/');
    else {
        const thisone = await Vine.findOne({ where: { username: req.session.email, id: req.params.id }} )
        console.log(thisone);
        let quan = thisone.Quantity - 1;
        if (quan < 0)
            quan = 0;
        console.log('NEW QUANTITY =' + quan)
        let send = await Vine.update({ Quantity: quan }, {where:{ id: req.params.id, username: req.session.email }})
        console.log('vin bien réduit');
        res.sendStatus(200)
    }
});

router.delete('/rm/:id', async function(req, res) {
    console.log('RM');

    if (!req.session.email)
        res.redirect('/');
    else {
        let send = await Vine.destroy({ where: { username: req.session.email, id: req.params.id }} )
        console.log('vin bien supprimé');
        res.sendStatus(200)
    }
});

router.delete('/rm/stage/:id', async function(req, res) {
    console.log('RM');

    if (!req.session.email)
        res.redirect('/');
    else {
        let send = await Stage.destroy({ where: { username: req.session.email, id: req.params.id }} )
        console.log('stage bien supprimé');
        res.sendStatus(200)
    }
});

router.put('/plus/:id', async function(req, res) {
    console.log('PLUS');
    console.log(req.body);
    if (!req.session.email)
        res.redirect('/');
    else {
        const thisone = await Vine.findOne({ where: { username: req.session.email, id: req.params.id }} )
        console.log(thisone);
        let quan = thisone.Quantity + 1;
        console.log('NEW QUANTITY =' + quan)
        let send = await Vine.update({ Quantity: quan }, {where:{ id: req.params.id, username: req.session.email }})
        console.log('vin bien ajouté');
        console.log('username =' + req.session.email);
        res.sendStatus(200)
    }
});

router.get('/add', (req, res, next) => {
    console.log('GET ADD');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        req.flash('Co','Se déconnecter');
        res.render('add');
    }
});

router.get('/addstage', (req, res, next) => {
    console.log('GET ADD');
    if (!req.session.email) {
        req.flash('info','Veuillez vous connecter');
        res.redirect('/login');
    } else {
        req.flash('Co','Se déconnecter');
        res.render('addstage');
    }
});

router.get('/logout', function(req, res) {
    console.log('POST LOGOUT');
    console.log('loggin out');
    req.session.destroy();
    res.redirect('/');
});

router.get('/register', function(req, res) {
    if (!req.session.email) {
        console.log('GET REGISTER');
        res.render('register');
    } else {
        res.redirect('/')
    }
});

router.get('/login', function(req, res) {
    if (!req.session.email) {
        console.log('GET LOGIN');
        res.render('login');
    } else {
        res.redirect('/')
    }
});

router.post('/login', async function(req, res) {
    console.log('POST LOGIN');
    console.log(req.body);
    const username = await User.findOne({ where: { firstName: req.body.prenom }});
    if (username != null) {
        if (username.password == req.body.password) {
            console.log('correct password i let you in :)');
            req.session.email = req.body.prenom;
            req.session.password = req.body.password;
            res.redirect('/');
        } else {
            console.log('invalid password');
            req.flash('info','Mauvais mot de passe');
            res.redirect('/login');
        }
    } else {
        console.log('invalid account');
        req.flash('info',"Le compte n'existe pas");
        res.redirect('/login');
    }
});

router.post('/register', async function(req, res) {
    console.log('POST REGISTER');
    console.log(req.body);
    const found = await User.findOne({ where: { firstName: req.body.prenom }});
    if (found == null) {
        console.log('le compte n existe pas et peut être créer');
        await User.create({ firstName: req.body.prenom, password: req.body.password });
        res.redirect('/login')
    } else {
        console.log('le compte existe déjà');
        req.flash('info','Le compte existe déjà');
        res.render('register');
    }
});

router.use(function(req, res){
    res.status(404).send('Page introuvable !');
});

module.exports = router;