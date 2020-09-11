const express = require('express')
const path = require('path')
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy


const GITHUB_CLIENT_ID = "6212ae257ed7c43f0d7e";
const GITHUB_CLIENT_SECRET = "3ed6a6cef35571b0026449918ea70f8fec85bc39";
const CALLBACK_URL = process.env.URL_CALLBACK || "http://localhost:3000/auth/github/callback"


passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: CALLBACK_URL
    },
    function (accessToken, refreshToken, profile, cb) {
        /*
        User.findOrCreate({ githubId: profile.id }, function (err, user) {
            console.log(user)
            return cb(err, user);
        });
        */
        return cb(null, profile);
    }
));


const app = express()

app.set('views', __dirname + '/views');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

passport.serializeUser(function(user, cb) {
    cb(null, user);
});  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());


app.get('/',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res) {
        res.sendFile(path.join(__dirname + '/views/index.html'));
    });


app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/login.html'));
})


app.get('/auth/github', 
    passport.authenticate('github'));

app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        //Successful authentication, redirect home.
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


app.listen(process.env.PORT || 3000);


/*
FUENTE:
    http://www.passportjs.org/packages/passport-github/
    https://github.com/passport/express-4.x-facebook-example
    https://docs.github.com/en/developers/apps/authorizing-oauth-apps#non-web-application-flow
    https://github.com/jaredhanson/passport-github
*/