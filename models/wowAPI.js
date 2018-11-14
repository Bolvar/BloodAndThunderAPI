var request = require('request');
var wowAPI = {};
//this file resumes all needed access to blizzard API

//guild list
wowAPI.getGuildCharacters = () => {
  return new Promise((resolve, reject) => {
    const url = `${blizz.base}guild/ragnaros/Blood%20n%20Thunder?apikey=${blizz.key}&locale=en_US&fields=members`;
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body));
      }
      else {
        reject(errorCodeHandler(response.statusCode));
      };
    })
  });
}

//race list
wowAPI.getRaceArray = () => {
  return new Promise((resolve, reject) => {
    var raceAPIurl = `${blizz.base}data/character/races?apikey=${blizz.key}&locale=es_ES`;
    request.get(raceAPIurl, function (error, response, body) {
      let tempArr = [];
      if (!error && response.statusCode == 200) {
        (JSON.parse(body).races).forEach(function (value) {
          tempArr[value.id] = value.name;
        })
        resolve(tempArr);
      }
      else {
        reject(errorCodeHandler(response.statusCode));
      };
    })
  });
}

//class list
wowAPI.getClassArray = () => {
  return new Promise((resolve, reject) => {
    const classAPIurl = `${blizz.base}data/character/classes?apikey=${blizz.key}&locale=es_ES`;
    request.get(classAPIurl, function (error, response, body) {
      let tempArr = [];
      if (!error && response.statusCode == 200) {
        (JSON.parse(body).classes).forEach(function (value) {
          tempArr[value.id] = value.name;
        })
        resolve(tempArr);
      }
      else {
        reject(errorCodeHandler(response.statusCode));
      };
    })
  });
}

//return player info
wowAPI.getPlayerInfo = name => {
  return new Promise((resolve, reject) => {
    const url = `${blizz.base}character/ragnaros/${name}?apikey=${blizz.key}&locale=en_US&fields=items`;
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body));
      }
      else {
        reject(errorCodeHandler(response.statusCode));
      };
    })
  });
}

function errorCodeHandler(statusCode) {
  switch (statusCode) {
    case 404:
      return ({ error: true, message: "Character not found" });
    case 503:
      return ({ error: true, message: "Character unavailable" });
    default:
      return ({ error: true, message: `Unexpected Error Code (${statusCode})` });
  }
}
module.exports = wowAPI;
