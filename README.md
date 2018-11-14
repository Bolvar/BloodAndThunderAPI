# BloodAndThunder with Restify

### Installation

BloodAndThunder requires [Node.js](https://nodejs.org/) to run.

#### Step one
Install the dependencies

```sh
$ git clone https://github.com/Bolvar/BloodAndThunderRestify.git <projectName>
$ cd <projectName>
$ npm install
```

#### Step two
create ./config.js
```js
var mysql = require('mysql');
module.exports = {
  name: 'rest-api',
  hostname: 'hostname',
  version: '0.0.1',
  env: process.env.NODE_ENV || 'development',
  port: 3000,
  apiKey: 'blizzardApiKey'
  db: {
    get: mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'database'
    })
  }
}
```
#### Step three
...run
```sh
$ node app
```
---
#### Command Palette

List of Characters
```sh
$ curl --request GET --url http://api.flako.xyz/guild
```

Class Statistics
```sh
$ curl --request GET --url http://api.flako.xyz/class
```

Character Detail
```sh
$ curl --request GET --url 'http://api.flako.xyz/character/:name'
```

Character Progress
```sh
$ curl --request GET --url ' http://api.flako.xyz/charHistory/:name
```

### TODO
  -A lot of Things...this is just de begining
