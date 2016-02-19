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
                'info': 1,
                'debug': 3,
                'error': 5
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