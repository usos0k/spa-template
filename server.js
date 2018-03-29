/**
 * Module dependencies.
 */

var express = require('express');
var vhost = require('vhost');
var constants = require('constants');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var fs = require('fs');
var https = require('https');
var supportedLan = ["en", "ko"];
var accepts = require('accepts');


var privateKey = fs.readFileSync('./sslcerts/ssl.key', 'utf8');
var certificate = fs.readFileSync('./sslcerts/ssl.crt', 'utf8');
var ca = fs.readFileSync('./sslcerts/ChainCA/rsa-dv.chain-bundle.pem', 'utf8');
var options = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app = express();

app.use(express.static('public'));

// Request body parsing middleware should be above methodOverride
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(methodOverride());

// Add the cookie parser and flash middleware
app.use(cookieParser());


app.get('/', function(req, res) {
    // var accept = accepts(req);
    // var browserLan = accept.language()[0];
    //
    // if(browserLan.indexOf('-') != -1)
    // {
    //     browserLan = browserLan.split('-')[0];
    // }
    //
    // if(supportedLan.indexOf(browserLan) == -1)
    //     browserLan = 'en';
    //
    // res.sendFile(path.resolve('./public/index-'+ browserLan +'.html'));

    res.sendFile(path.resolve('./public/index.html'));

});
app.get('/ko', function(req, res) {
    res.sendFile(path.resolve('./public/index-ko.html'));
});
app.get('/en', function(req, res) {
    res.sendFile(path.resolve('./public/index-en.html'));
});
app.get('/cn', function(req, res) {
    res.sendFile(path.resolve('./public/index-zh.html'));
});
app.post('/api/email-subscription', function(req, res) {
    var data = req.body.email + ' 이름: ' + (req.body.name ? req.body.name : '') + '\n';
    fs.appendFile('user-email-list.txt', data, function (err) {
        if(err)
        {
            throw err;
        }
        res.json(req.body);
    });
});

var server = https.createServer(options, app);

server.listen(443, function(){
    console.log("server running at 443")
});

var appVhost = express();

appVhost.use(express.static('public'));

// Request body parsing middleware should be above methodOverride
appVhost.use(bodyParser.urlencoded({ extended: true }));
appVhost.use(bodyParser.json({ limit: '50mb' }));
appVhost.use(methodOverride());

// Add the cookie parser and flash middleware
appVhost.use(cookieParser());

appVhost.use('*', function (req, res) {
    var host = req.header("host");
    return res.redirect(301, 'https://' + host + req.path);
});

appVhost.get('/', function(req, res) {
    var accept = accepts(req);
    var browserLan = accept.language()[0];

    if(browserLan == 'zh-CN')
        browserLan = 'zh';
    if(supportedLan.indexOf(browserLan) == -1)
        browserLan = 'en';

    res.sendFile(path.resolve('./public/index-'+ browserLan +'.html'));
});
appVhost.get('/ko', function(req, res) {
    res.sendFile(path.resolve('./public/index-ko.html'));
});
appVhost.get('/en', function(req, res) {
    res.sendFile(path.resolve('./public/index-en.html'));
});
appVhost.get('/cn', function(req, res) {
    res.sendFile(path.resolve('./public/index-zh.html'));
});
appVhost.post('/api/email-subscription', function(req, res) {
    var data = req.body.email + ' 이름: ' + (req.body.name ? req.body.name : '') + '\n';
    fs.appendFile('user-email-list.txt', data, function (err) {
        if(err)
        {
            throw err;
        }
        res.json(req.body);
    });
});

appVhost.listen(80, function () {
    console.log('Express Vhost started on port 80');
});