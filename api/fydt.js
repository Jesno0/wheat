'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Frame = require('koa2frame'),
    Base = Frame.api,
    Err = Frame.error,
    Fydt = require('../domain/fydt'),
    FydtExt = require('../external/fydt');

class cls extends Base{
    constructor () {
        super();
        this.is_cache = {
            "1": "1",
            "0": "0"
        }
        this.formats = {
            doc: "文档",
            audio: "音频"
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
    const {catalogues,is_cache,formats,type} = ctx.body;
    const cats = await Fydt.getResourceList(catalogues,parseInt(is_cache));
    
    let save_path = ctx.body.save;
    if(save_path.slice(save_path.length-1) == '/')
        save_path = save_path.slice(0,save_path.length-1);
    
    let list = [];
    for(let cat of cats) {
        const resources = cat.resources;
        const save = `${save_path}${cat.save}`;
        list = list.concat(await Fydt.check(resources,save,formats,type=='reload'));
    }

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
            await Fydt.async(list);
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
                        "enum": Object.keys(FydtExt.catalogues)
                    }
                },
                "type": {
                    "enum": Object.keys(instance.types)
                },
                "formats": {
                    "type": "array",
                    "items": {
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
        catalogues: Object.keys(FydtExt.catalogues),
        is_cache: Object.keys(instance.is_cache).map(id => {
            return {
                id,
                name: instance.is_cache[id]
            }
        }),
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