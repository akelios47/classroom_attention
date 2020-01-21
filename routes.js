const express = require('express');
const router = express.Router();
const passport = require('passport');

// login
const loginRoute = require('./routes/loginRoute');
router.use('/' + process.env.VERSION + '/login', loginRoute);

// log
const logRoute = require('./routes/logRoute');
router.use('/' + process.env.VERSION + '/log', passport.authenticate('jwt', {session: false}), logRoute);

// user
const userRoute = require('./routes/userRoute');
router.use('/' + process.env.VERSION + '/users', passport.authenticate('jwt', {session: false}), userRoute);
const usernameRoute = require('./routes/usernameRoute');
router.use('/' + process.env.VERSION + '/usernames', passport.authenticate('jwt', {session: false}), usernameRoute);

// tag
const tagsRoute = require('./routes/tagRoute');
router.use('/' + process.env.VERSION + '/tags', passport.authenticate('jwt', {session: false}), tagsRoute);

// teacher
const teachersRoute = require('./routes/teacherRoute');
router.use('/' + process.env.VERSION + '/teachers', passport.authenticate('jwt', {session: false}), teachersRoute);

// course
const coursesRoute = require('./routes/courseRoute');
router.use('/' + process.env.VERSION + '/courses', passport.authenticate('jwt', {session: false}), coursesRoute);

// reading
const readingsRoute = require('./routes/readingRoute');
router.use('/' + process.env.VERSION + '/readings', passport.authenticate('jwt', {session: false}), readingsRoute);

module.exports = router;
