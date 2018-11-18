const config = require('./config');
var restify = require('restify');
var cors = require('cors');
var wowDb = require('./models/wowDB');
var wowAPI = require('./models/wowAPI');

global.connection = config.db.get;
global.blizz = { base: "https://us.api.battle.net/wow/", key: config.apiKey }

//both of them only change on a new expansion..so we load them on the start and keep de data on memory so we can use it
wowAPI.getClassArray().then(result => global.classArray = result);
wowAPI.getRaceArray().then(result => global.raceArray = result);

const server = restify.createServer({
  name: config.name,
  version: config.version,
  url: config.hostname
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(cors());

server.listen(config.port, function () {
  console.log(`${config.name} listening at ${config.hostname}:${config.port}`);
});



server.get('/character/:name/history', (req, res) => {
  const character = req.params.name;
  wowDb.getPlayerHistory(character)
    .then(results => {
      try {
        res.json(results);
      }
      catch (error) {
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

//ugly code but works...redo...plz
server.get('/update', (req, res) => {
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
      response.members.forEach(async (value, index) => {
        const a = await wowDb.getPlayerInfo(value.character.name)
          .then((results) => {
            //if character exist in db, return full model data
            return results;
          })
          .catch((res) => {
            //if character doesn't exist in db, return blizzard api data and fill error message
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
      }
      catch (error) {
        throw Error(error);
      }
    });
});
