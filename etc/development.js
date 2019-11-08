'use strict';

module.exports = {
    http : {
        port : 3003,
        timeout: 5000
    },

    log: {
        route: true,
        db: false,
        external: false,
        error: {
            console: true,
            storage: 'file'
        }
    },

    external: {
        fydt: {
            url: 'https://fuyindiantai.org'
        }
    }
};