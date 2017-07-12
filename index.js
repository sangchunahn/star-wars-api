const express = require('express');  
const request = require('request');
const path = require('path')
const _ = require('lodash');
const app = module.exports = express();

const swapi = 'http://swapi.co/api/'

// EJS //
app.set('view engine', 'ejs');

const controller = require('./controller')

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/character/:name', controller.getCharacterByName)
app.get('/characters', controller.getAllCharactersBySort)
app.get('/planetresidents', controller.getAllPlanetResidents)

app.listen(3000, () => {  
    console.log('Listening on port 3000');
});