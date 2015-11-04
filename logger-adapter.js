'use strict';

var winston = require('winston');
var config;
var logger;

module.exports = {
    initAdapter: (connector, _config) => {
        config = _config;

        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)()
            ],
            level: config.level
        });
    },

    log: function () {
        logger.log.apply(logger, Array.prototype.slice.call(arguments));
    }
};