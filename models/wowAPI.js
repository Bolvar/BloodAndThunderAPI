var request = require('request');
var wowAPI = {};
//this file resumes all needed access to blizzard API

wowAPI.getToken = () => {
    const url = {
        url: 'https://us.battle.net/oauth/token',
        method: 'POST',
        qs: {
            grant_type: "client_credentials"
        },
        auth: {
            'user': blizz.key.public,
            'pass': blizz.key.secret
        }
    };
    return new Promise((resolve, reject) => {
        request.post(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(JSON.parse(body));
            };
        })
    })
}

//guild list
wowAPI.getGuildCharacters = () => {
        return new Promise((resolve, reject) => {
            const url = {
                url: `${blizz.base}guild/ragnaros/Blood%20n%20Thunder`,
                method: 'POST',
                qs: {
                    access_token: blizz.key.accessToken,
                    locale: blizz.key.locale,
                    fields: "members"
                },
            }
            request.get(url, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(errorCodeHandler(response.statusCode));
                };
            })
        });
    }
    //race list
wowAPI.getRaceArray = () => {
    return new Promise((resolve, reject) => {
        const raceAPIurl = {
            url: `${blizz.base}data/character/races`,
            method: 'POST',
            qs: {
                access_token: blizz.key.accessToken,
                locale: blizz.key.locale,
            },
        }
        request.get(raceAPIurl, function(error, response, body) {
            let tempArr = [];
            if (!error && response.statusCode == 200) {
                (JSON.parse(body).races).forEach(function(value) {
                    tempArr[value.id] = value.name;
                })
                resolve(tempArr);
            } else {
                reject(errorCodeHandler(response.statusCode));
            };
        })
    });
}

//class list
wowAPI.getClassArray = () => {
    return new Promise((resolve, reject) => {
        const classAPIurl = {
            url: `${blizz.base}data/character/classes`,
            method: 'POST',
            qs: {
                access_token: blizz.key.accessToken,
                locale: blizz.key.locale,
            },
        }
        request.get(classAPIurl, function(error, response, body) {
            let tempArr = [];
            if (!error && response.statusCode == 200) {
                (JSON.parse(body).classes).forEach(function(value) {
                    tempArr[value.id] = value.name;
                })
                resolve(tempArr);
            } else {
                reject(errorCodeHandler(response.statusCode));
            };
        })
    });
}

//return player info
wowAPI.getPlayerInfo = name => {
    return new Promise((resolve, reject) => {
        const url = {
            url: `${blizz.base}character/ragnaros/${name}`,
            method: 'POST',
            qs: {
                access_token: blizz.key.accessToken,
                locale: blizz.key.locale,
                fields: "items"
            },
        }
        request.get(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(errorCodeHandler(response.statusCode, name));
            };
        })
    });
}

function errorCodeHandler(statusCode, player = "unknown") {
    switch (statusCode) {
        case 404:
            return ({ error: true, message: `Error ${player}, Character not found` });
        case 503:
            return ({ error: true, message: `Error ${player}, Service unavailable` });
        case 500:
            return ({ error: true, message: `Internal Server Error` });
        default:
            return ({ error: true, message: `Unexpected Error Code (${statusCode})` });
    }
}
module.exports = wowAPI;