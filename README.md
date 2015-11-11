# node-winston-logger-adapter

This package is used for logging using winston.

## Installation

npm install winston-logger-adapter

## Example

```
var logger = require('.');

var config = {
  level: 'debug',
  enableMails: true,
  mailConfig: {
    to: '', // Example Leslie <leslie@example.com>
    host: "",
    port: 465,
    ssl: true,
    username: '',
    password: '',
    subject: 'Example subject',
    from: 'Example Sender <sender@example.com>', // EX: 'I'M A BOT <bot@test.com>, ...'
    level: 'error'
  }
}

logger.initAdapter({}, config);

logger.log('error', 'asdadasda');
```


