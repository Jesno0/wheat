'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Base = require('koa2frame').api,
    File = require('../domain/file');

class cls extends Base{
    constructor () {
        super('file');
        this.formats = {
            doc: "文档",
            audio: "音频",
            video: "视频",
            other: "其他"
        };
        this.types = {
            check: "检测",
            update: "下载更新",
            reload: "重新下载"
        };
    }
}

let instance = new cls();

cls.prototype.sync = async function (ctx) {
    let body = ctx.request.body,
        type = body.type,
        formats = body.formats,
        url = body.url,
        save_path = body.save,
        is_dir = Boolean(parseInt(body.is_dir)),
        is_reload = Boolean(type=='reload');
    if(save_path.slice(save_path.length-1) != '/')
        save_path += '/';

    switch (type) {
        case 'check':
            return File.check(url,save_path,is_reload,is_dir,formats);
        case 'update':
        case 'reload':
        default:
            return File.async(url,save_path,is_reload,is_dir,formats);
    }
};
cls.prototype.sync.settings__ = {
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
                    "enum": Object.keys(instance.types)
                },
                "is_dir": {
                    "enum": [0,1,"0","1"]
                },
                "formats": {
                    "type": "array",
                    "items": {
                        "enum": Object.keys(instance.formats)
                    }
                }
            },
            "required":["url","save","formats"]
        }
    }
};

cls.prototype.init = async function () {
    return {
        formats: Object.keys(instance.formats).map(id => {
            return {
                id,
                name: instance.formats[id]
            }
        }),
        types: Object.keys(instance.types).map(id => {
            return {
                id,
                name: instance.types[id]
            }
        })
    }
};
module.exports = new cls();