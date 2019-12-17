'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Base = require('koa2frame').api,
    Fydt = require('../domain/fydt'),
    FydtExt = require('../external/fydt');

class cls extends Base{
    constructor () {
        super();
    }
}

cls.prototype.sync = async function (ctx) {
    let body = ctx.body,
        cats = await Fydt.getResourceList(body.catalogues),
        save_path = body.save,
        formats = body.formats,
        type = body.type,
        i, resources, save,
        list = [];

    if(save_path.slice(save_path.length-1) == '/')
        save_path = save_path.slice(0,save_path.length-1);

    for(i=0; i<cats.length; i++) {
        resources = cats[i].resources;
        save = `${save_path}${cats[i].save}`;
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
            return Fydt.update(list);
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
                        "enum": Object.keys(FydtExt.catalogues)
                    }
                },
                "type": {
                    "type": "string",
                    "enum": ["check","reload","update"]
                },
                "formats": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["audio","doc"]
                    }
                }
            },
            "required":["type","save","catalogues","formats"]
        }
    }
};

module.exports = new cls();