'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Base = require('koa2frame').api,
    Story = require('../domain/story');

class cls extends Base{
    constructor () {
        super('520story');
    }
}

cls.prototype.sync = async function (ctx) {
    let query = ctx.query,
        type = query.type,
        url = query.url,
        save_path = query.save;
    if(save_path.slice(save_path.length-1) != '/')
        save_path += '/';

    switch (type) {
        case 'check':
            return Story.check520(url,save_path);
        case 'update':
        case 'reload':
        default:
            return Story.async520(url,save_path,type=='reload');
    }
};
cls.prototype.sync.settings = {
    params: {
        is_filter: true,
        query: {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string"
                },
                "save": {
                    "type": "string"
                },
                "type": {
                    "type": "string",
                    "enum": ["check","update","reload"]
                }
            },
            "required":["url","save"]
        }
    }
};

module.exports = new cls();