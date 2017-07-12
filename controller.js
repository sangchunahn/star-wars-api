const app = require('./index');
const request = require('request');
const path = require('path')
const _ = require('lodash');
const swapi = 'http://swapi.co/api/'

function getAllCharacters(urlNext) {
  const url = urlNext ? urlNext : `${swapi}people/`
  return new Promise((fulfill, reject) => {
    request(url, (err, response) => {
      let characters = JSON.parse(response.body)
      if (err || _.isEmpty(characters.results)) {
        reject(err)
      } else if (characters.next) {
        // Recursion to constantly get the data of the next page
        getAllCharacters(characters.next).then((moreCharacters) => {
          fulfill(_.concat(characters.results, moreCharacters))
        })
      } else {
        fulfill(characters.results)
      }
    })
  }).catch(err => {
    reject(err)
  })
}

function getAllPlanets(urlNext) {
  const url = urlNext ? urlNext : `${swapi}planets/`
  return new Promise((fufill, reject) => {
    request(url, (err, response) => {
      let planets = JSON.parse(response.body)
      if (err || _.isEmpty(planets.results)) {
        reject(err)
      } else if (planets.next) {
        // Recursion to constantly get the data of the next page
        getAllCharacters(planets.next).then((morePlanets) => {
          fufill(_.concat(planets.results, morePlanets))
        })
      } else {
        fufill(planets.results)
      }
    })
  }).catch(err => {
    reject(err)
  })
}

module.exports = {
    getCharacterByName: (req, res) => {
    const url = `${swapi}people/?search=${req.params.name}`
    request(url, (err, response) => {
      let character = JSON.parse(response.body);
      console.log('character: ', character);
      if (err || _.isEmpty(character.results)) {
          res.render('error', { lookUp: { name: req.params.name } });
      } else {
          res.render('character', {person: character.results[0]});
      } 
    })
  },
  getAllCharactersBySort: (req, res) => {
    getAllCharacters().then((allCharacters) => {
        if (req.query.sort === 'height' || req.query.sort === 'mass' || req.query.sort === 'name') {
          allCharacters = _.sortBy(allCharacters, character => {
            return parseFloat(character[req.query.sort])
          })
        } 
      let characterLimit = allCharacters.slice(0, 50)
      console.log('characterLimit: ', characterLimit);
      res.json(characterLimit)
    }).catch(err => {
      res.send(err)
    })
  },

  getAllPlanetResidents: (req, res) => {
    getAllCharacters().then(allCharacters => {
      getAllPlanets().then(getAllPlanets => {
        let characters = allCharacters;
        let planets = getAllPlanets;
        let planetNames = {};
        _.map(planets, planet => {
          planetNames[planet.name] = [];
          _.map(characters, character => {
            _.map(planet.residents, resident => {
              if(resident === character.url)  {
                planetNames[planet.name].push(character.name)
              }
            })
          })
        })
        console.log('planetNames: ', planetNames);
        res.json(planetNames)
      }) 
    }).catch(err => {
      res.send(err)
    })
  }

}

