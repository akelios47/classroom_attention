const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const errorHandlers = require('./commons/errorHandlers.js');
const swagger = require('swagger-jsdoc');
const info = require('./package.json');
const cors = require('cors');
var https = require('https');
var http = require('http');
var fs = require('fs');
var compression = require('compression');

// https credentials
var cert_file;
var key_file
// self-signed no ssl on local
if (process.env.ENV === 'development' || process.env.ENV === 'test') {
    cert_file = './resources/caCert.pem'; // The certificate
    key_file = './resources/privateKey.pem'; // The private key
}
// authority signed ssl enable on remote (renew certificate every 3-months!)
else if(process.env.ENV === 'production'){
    cert_file = './resources/fullchain.pem'; // The certificate
    key_file = './resources/privkey.pem'; // The private key
}

// Express server
const app = express();

// compress all responses
app.use(compression());

// Doc engine
const options = {
    swaggerDefinition: {
        info: {
          title: info.name,
          version: info.version,
          description: info.description,
        },
        basePath: '/' + process.env.VERSION + '/',
        tags: [
            { name:"Tag", description:"A label attached to a reading to identify it. A reading can be described by one or more tags." },
            { name:"Teacher", description:"Academic information that identifies a class giver." },
            { name:"Course", description:"Description of a courses taugh an an academic institution." },
            { name:"Reading", description:"Description of a reading from the IoT peripheral edge in the classroom." }
        ]
      },
    // path to the API docs
    apis: ['./models/*.js', './routes/*.js']
};
const apidoc = swagger(options);

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS (cross-domain requests)
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Logger
if(process.env.LOG === 'enabled') {
    const logger = require('./commons/logger.js');
    app.use(logger);
}

// Serves static files from the public folder. 
// Anything in public/ or api-doc/ foldes will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'api-doc')));
app.get('/v1', (req, res, next) => { res.redirect(req.baseUrl + '/'); });

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}))

// Attach routes
app.use(require('./routes'));

// serve documentation
app.get('/' + process.env.VERSION + '/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(apidoc);
});

// If that above routes didnt work, 
// we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Development or production error handler
if (process.env.ENV === 'development') { app.use(errorHandlers.developmentErrors); }
else if (process.env.ENV === 'test') { app.use(errorHandlers.developmentErrors); }
else app.use(errorHandlers.productionErrors);

// Create HTTP or HTTPS server
let server = null;
try {
    const passphrase = 'atmospherePass';  // The password of the private key
    const config = { key: fs.readFileSync(key_file), cert: fs.readFileSync(cert_file), passphrase: passphrase };
    server = https.createServer(config, app );
    const instance = server.listen(443, () => { console.log('Classroom Attention  API is running on port ' +  instance.address().port); });
}
catch(err) {
    server = http.createServer(app);
    const instance = app.listen(8084, "0.0.0.0", () => { console.log('WARNING: HTTPS not running, Classroom Attention  API is running on port ' +  instance.address().port + ' (' + err + ')'); });
}

module.exports = server;
