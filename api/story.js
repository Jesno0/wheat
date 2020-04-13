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
        this.types = {
            check: "检测",
            update: "下载更新",
            reload: "重新下载"
        }
    }
}

let instance = new cls();

cls.prototype.sync = async function (ctx) {
    let body = ctx.body,
        type = body.type,
        url = body.url,
        save_path = body.save;
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
        body: {
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

cls.prototype.init = async function () {
    return {
        types: Object.keys(instance.types).map(id => {
            return {
                id,
                name: instance.types[id]
            }
        })
    }
};
module.exports = new cls();