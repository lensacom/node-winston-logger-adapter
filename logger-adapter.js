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

function convertErrorInsteadOfMsgArgToWinston(args) {
    var level = args.shift();
    var msg = args.shift();
    var meta = args.shift() || {};
    var message = msg;
    var i = 3;

    if (msg instanceof Error) {
        message = msg.message;

        if (typeof meta === 'object') {
            meta = Object.assign(msg, meta);
        } else {
            meta = msg;
            meta['logArg' + i] = meta;
            i += 1;
        }
    }
    if (typeof meta === 'object') {
        args.forEach(function (elem) {
            meta['logArg' + i] = elem;
            i += 1;
        });
    }
    return [level, message, meta];
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
        var args = convertErrorInsteadOfMsgArgToWinston([].slice.call(arguments));
        throttle.apply(null, args)
            .then(isThrottled => {
                if (!isThrottled) {
                    logger.log.apply(logger, args);
                }
            })
            .catch(err => {
                logger.log('error', err);
                logger.log.apply(logger, args);
            });
    }
};
