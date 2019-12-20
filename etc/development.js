'use strict';

module.exports = {
    http : {
        port : 3003,
        timeout: 10000
    },

    log: {
        route: true,
        db: true,
        external: true,
        error: {
            console: true,
            storage: 'file'
        }
    },

    external: {
        fydt: {
            url: 'https://www.fydt.org'//fuyindiantai.org
        }
    }
};