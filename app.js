const config = require('./config');
const restify = require('restify');
const cors = require('cors');
const wowDb = require('./models/wowDB');
const wowAPI = require('./models/wowAPI');

global.connection = config.db.get;
global.blizz = { base: "https://us.api.blizzard.com/wow/", key: config.oauth };
wowAPI.getToken().then(async result => {
    //wait until we have a token
    await (config.oauth.accessToken = result.access_token);

    //both of them only change on a new expansion, so... we load them on the start and keep de data on memory so we can use it
    wowAPI.getClassArray().then(result => global.classArray = result).catch(err => console.log(err));
    wowAPI.getRaceArray().then(result => global.raceArray = result).catch(err => console.log(err));

    server.listen(config.port, function() {
        console.log(`${config.name} listening at ${config.hostname}:${config.port}`);
    });
});

const server = restify.createServer({
    name: config.name,
    version: config.version,
    url: config.hostname
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(cors());

server.get('/character/:name/history', (req, res) => {
    const character = req.params.name;
    wowDb.getPlayerHistory(character)
        .then(results => {
            try {
                res.json(results);
            } catch (error) {
                throw Error(error);
            }
        });
});

server.get('/character/:name', (req, res) => {
    const character = req.params.name;
    wowDb.getPlayerInfo(character)
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            res.json(err);
        });
});

server.get('/token', (req, res) => {
    wowAPI.getToken()
        .then(results => {
            if (config.oauth.accessToken == results.access_token) {
                res.json({ error: false, message: "Token Up to date" });
            } else {
                config.oauth.accessToken = results.access_token;
                res.json({ error: false, message: "Token Updated" });
            }

        })
        .catch(err => {
            res.json({ error: true, message: err });
        });
});

//ugly code but works...redo...plz
/*firs we get the list, then get the player info from blizzard, then check the last update, if diferent
then update, else don't and print log
*/
server.get('/update', (req, res) => {
    console.log(Date());
    wowAPI.getGuildCharacters()
        .then(result => {
            result.members.forEach((value, index) => {
                wowAPI.getPlayerInfo(value.character.name)
                    .then(info => {
                        wowDb.getLastUpdate(info)
                            .then(result => {
                                if (result.message[0].total == 0) {
                                    wowDb.putPlayerData(info)
                                        .then(result => {
                                            console.log(result);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        });
                                }
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
                if (index == result.members.length - 1) res.json({ error: false, message: "Ok" });
            })
        })
        .catch(err => {
            res.json({ "error": false, "message": err });
        })
});

server.get('/guild', (req, res) => {
    wowAPI.getGuildCharacters()
        .then((response) => {
            const output = [];
            response.members.forEach(async(value, index) => {
                const a = await wowDb.getPlayerInfo(value.character.name)
                    .then((results) => {
                        //if character exist in db, return full model data
                        return results;
                    })
                    .catch((res) => {
                        //if character doesn't exist in db, return blizzard api data and fill error message

                        //will i have to create a character object?
                        return {
                            name: value.character.name,
                            level: value.character.level,
                            class: classArray[value.character.class],
                            race: raceArray[value.character.race],
                            gender: value.character.gender,
                            achievementPoints: value.character.achievementPoints,
                            averageItemLevelEquipped: 0,
                            lastModified: 0,
                            error: res.error,
                            message: res.message
                        };
                    });
                output.push(a);
                if (index == response.members.length - 1) res.json(output);
            });
        })
        .catch((error) => {
            //if everything goes wrong, return error
            res.json({ "error": true, "message": error });
        });
});

server.get('/guild/class', (req, res) => {
    wowDb.getClassResume()
        .then(results => {
            try {
                (results).forEach((value, index) => {
                    results[index].class = classArray[value.class];
                })
                res.json(results);
            } catch (error) {
                throw Error(error);
            }
        });
});