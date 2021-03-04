'use strict';
/**
 * Created by Jesn on 2021/3/3.
 *
 */

const Frame = require('koa2frame'),
    Base = Frame.api,
    Err = Frame.error,
    Wdbible = require('../domain/wdbible'),
    WdbibleExt = require('../external/wdbible');

class cls extends Base{
    constructor () {
        super();
        this.types = {
            check: "检测",
            reload: "重新下载"
        };
    }
}

let instance = new cls();

cls.prototype.sync = async function (ctx) {
    const body = ctx.body;
    const {type,cookie} = body;
    let save_path = body.save;

    if(save_path.slice(save_path.length-1) == '/')
        save_path = save_path.slice(0,save_path.length-1);

    const resources = await Wdbible.getResourceList(body.catalogues,save_path,cookie,parseInt(body.is_cache));
    const file_path = resources[0][0];

    switch (type) {
        case 'check':
            return {
                total: resources[0][1].length,
                rows: resources[0][1]
            };
        case 'reload':
            await Wdbible.writeNote(resources);
            return Err.get(Err.ok,null,`生成文档路径：${file_path}`);
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
                        "enum": Object.keys(WdbibleExt.catalogues)
                    }
                },
                "type": {
                    "type": "string",
                    "enum": Object.keys(instance.types)
                },
                "cookie": {
                    "type": "string"
                },
                "is_cache": {
                    "enum": [0,1,'0','1']
                }
            },
            "required":["type","save","catalogues","cookie"]
        }
    }
};

cls.prototype.init = async function () {
    return {
        catalogues: Object.keys(WdbibleExt.catalogues),
        types: Object.keys(instance.types).map(id => {
            return {
                id,
                name: instance.types[id]
            }
        })
    }
};
module.exports = instance;