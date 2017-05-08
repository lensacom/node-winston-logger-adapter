'use strict';

var winston = require('winston');
var Mail = require('winston-mail').Mail;
var Sentry = require('winston-sentry');
var config;
var logger;

module.exports = {
    initAdapter: (connector, _config) => {
        config = _config;

        logger = new winston.Logger({
            transports: [
                new winston.transports.Console({level: config.level})
            ],
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                verbose: 3,
                debug: 4,
                silly: 5
            },
            colors: {
                error: 'red',
                warn: 'yellow',
                info: 'green',
                verbose: 'cyan',
                debug: 'blue',
                silly: 'magenta'
            }
        });

        if (config.enableMails) {
            logger.add(Mail, config.mailConfig);
        }

        if (config.enableSentry) {
            logger.add(Sentry, config.sentryConfig);
        }
    },

    log: function () {
        logger.log.apply(logger, Array.prototype.slice.call(arguments));
    }
};
