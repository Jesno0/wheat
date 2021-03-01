'use strict';
/**
 * Created by Jesn on 2020/4/1.
 *
 */

const Frame = require('koa2frame'),
    Base = Frame.api,
    Err = Frame.error,
    AiShen = require('../domain/aishen'),
    AiShenExt = require('../external/aishen');

class cls extends Base{
    constructor () {
        super();
        this.formats = {
            txt: "txt",
            pdf: "pdf"
        };
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
        save_path = body.save,
        formats = body.formats,
        type = body.type;

    if(save_path.slice(save_path.length-1) == '/')
        save_path = save_path.slice(0,save_path.length-1);

    let resources = await AiShen.getResourceList(body.catalogues,save_path,parseInt(body.is_cache)),
        list = await AiShen.check(resources,formats,type=='reload');

    switch (type) {
        case 'check':
            return {
                total: list.length,
                rows: list.map(item => {
                    return item.slice(0,2);
                })
            };
        case 'reload':
        case 'update':
            await AiShen.async(list);
            return Err.get(Err.ok,null,'已成功添加任务，请查看任务列表。');
    }
};
cls.prototype.sync.settings = {
    params: {
        is_filter: true,
        body: {
            "type": "object",
            "properties": {
                "save": {
                    "type": "string"
                },
                "catalogues": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": Object.keys(AiShenExt.catalogues)
                    }
                },
                "type": {
                    "type": "string",
                    "enum": Object.keys(instance.types)
                },
                "formats": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": Object.keys(instance.formats)
                    }
                },
                "is_cache": {
                    "enum": [0,1,'0','1']
                }
            },
            "required":["type","save","catalogues","formats"]
        }
    }
};

cls.prototype.init = async function () {
    return {
        catalogues: Object.keys(AiShenExt.catalogues),
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
module.exports = instance;