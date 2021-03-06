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
            url: 'https://www.fydt.org',//fuyindiantai.org
            cache: true
        },
        '520story': {
            url: 'http://www.520tingshu.com',
            cache: false
        },
        ximalaya: {
            url: 'https://www.ximalaya.com',
            cache: false
        },
        aishen: {
            url: 'https://www.aishen360.com',
            cache: true
        },
        aishenFile: {
            url: 'https://webapi.ctfile.com',
            cache: true
        },
        bornforlove: {
            url: 'https://mp.weixin.qq.com',
            url_bak: 'http://mp.weixin.qq.com',
            cache: true
        },
        wdbible: {
            url: 'https://wd.bible',
            url_bak: '',
            cache: true
        },
        baiduFile: {
            url: 'https://wenku.baidu.com',
            cache: true
        }
    }
};