'use strict';

var winston = require('winston');
var Mail = require('winston-mail').Mail;
var Sentry = require('winston-sentry');
var connector;
var config;
var logger;
var throttle = function () {
    return Promise.resolve(false);
};

function initThrottle(config) {
    var throttleAdapter;
    if (!config) {
        return;
    }
    if (!config.adapter) {
        return;
    }
    if (typeof connector.getAdapter === 'function') {
        throttleAdapter = connector.getAdapter(config.adapter);
    } else {
        throttleAdapter = connector[config.adapter];
    }
    if (!throttleAdapter) {
        return;
    }
    if (typeof throttleAdapter.throttle !== 'function') {
        return;
    }

    throttle = function () {
        return Promise.resolve(throttleAdapter.throttle.apply(throttleAdapter, Array.prototype.slice.call(arguments)));
    }
}

module.exports = {
    initAdapter: (_connector, _config) => {
        connector = _connector;
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

        initThrottle(config.throttle);
    },

    log: function () {
        var argumentsArray = Array.prototype.slice.call(arguments);
        throttle.apply(null, argumentsArray)
            .then(isThrottled => {
                if (!isThrottled) {
                    logger.log.apply(logger, argumentsArray);
                }
            })
            .catch(err => {
                logger.log('error', err);
                logger.log.apply(logger, argumentsArray);
            });
    }
};
