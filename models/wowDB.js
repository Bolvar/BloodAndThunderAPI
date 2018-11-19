var wowDb = {};

// this returns a summary of how many characters we have from each class in the guild
wowDb.getClassResume = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT class,count(class) AS cant FROM (SELECT * FROM player GROUP by name) AS a GROUP BY class', function(error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        })
    })
}

//working..ran out of beer...continue tomorrow
//the idea is return json data about player progres, so we can put in on a chart and see how faster do we grow
wowDb.getPlayerHistory = (player) => {
        return new Promise((resolve, reject) => {
            sql = `SELECT lastModified,level, achievementPoints, totalHonorableKills, averageItemLevelEquipped FROM player WHERE name = '${player}' ORDER BY lastModified ASC`
            connection.query(sql, (error, results, fields) => {
                if (error) {
                    reject({
                        error: true,
                        message: error
                    });
                } else {
                    resolve({
                        error: false,
                        message: { name: player, results }
                    });
                }
            });
        })
    }
    //this is just to avoid insert data that i already have in database
wowDb.getLastUpdate = (player) => {
    return new Promise((resolve, reject) => {
        if (player.length == 0) {
            reject({
                error: true,
                message: error ? error : "Unspecified Character"
            });
        } else {
            sql = `SELECT count(*) as total FROM player WHERE name = '${player.name}' AND lastModified = ${player.lastModified}`
            connection.query(sql, (error, results, fields) => {
                if (error) {
                    reject({
                        error: true,
                        message: error
                    });
                } else {
                    resolve({
                        error: false,
                        message: results
                    });
                }
            });

        }
    });
}

//i run this every 30 minutes to check if any character had changed and store de data of the progress
wowDb.putPlayerData = (player) => {
    return new Promise((resolve, reject) => {
        if (player.length == 0) {
            reject({
                error: true,
                message: error ? error : "Unspecified Character"
            });
        } else {
            sql = `INSERT INTO player (lastModified, name, realm, class, race, gender, level, achievementPoints, totalHonorableKills, averageItemLevelEquipped) VALUES (${player.lastModified}, '${player.name}', '${player.realm}', ${player.class}, ${player.race}, ${player.gender}, ${player.level}, ${player.achievementPoints}, ${player.totalHonorableKills}, ${player.items.averageItemLevelEquipped})`
            connection.query(sql, (error) => {
                if (error) {
                    reject({
                        error: true,
                        message: error
                    });
                } else {
                    resolve({
                        error: false,
                        message: `Charactet ${player.name} inserted`
                    });
                }
            });

        }
    });
}

//this (like the name says) retrive the player info or in this case, character info
//is named player because 'character' is too long and 'char' will give some problems
wowDb.getPlayerInfo = (player) => {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM player WHERE name = '${player}' ORDER by lastModified DESC LIMIT 0,1`, (error, results, fields) => {
            //only players of level 10+ have armory information,
            //the players of lower level in the guild doesn't bring the 'averageItemLevelEquipped' element and 'lastModified' values,
            if (error || results.length == 0) {
                reject({
                    error: true,
                    message: error ? error : "Character doesn't exist in DB"
                });
            } else {
                resolve({
                    name: results[0].name,
                    level: results[0].level,
                    class: classArray[results[0].class],
                    race: raceArray[results[0].race],
                    gender: results[0].gender,
                    achievementPoints: results[0].achievementPoints,
                    averageItemLevelEquipped: results[0].averageItemLevelEquipped,
                    lastModified: results[0].lastModified,
                    error: false,
                    message: null
                });
            }
        });
    });
}
module.exports = wowDb;