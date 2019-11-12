'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Base = require('koa2frame').api,
    Fydt = require('../domain/fydt');

class cls extends Base{
    constructor () {
        super();
    }
}

cls.prototype.sync = async function (ctx) {
    let body = ctx.body,
        paths = await Fydt.getPaths(body.catalogues),
        save_path = body.save,
        formats = body.formats,
        type = body.type;

    if(save_path.slice(save_path.length-1) == '/') save_path = save_path.slice(0,save_path.length-1);
    let list = (await Promise.all(paths.map(async path => {
        return await Fydt.check(path[0],`${save_path}${path[1]}`,formats,type=='reload');
    }))).reduce((a,b) => {
        return a.concat(b);
    });

    switch (type) {
        case 'check':
            return list.map(item => {
                return item.slice(0,2);
            });
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
                    "item": {
                        "type": "string",
                        "enum": ["shujuanchakao","zhuantixilie","jiangdaoxinxi","shengjingyishenlun","shengmingzaisi"]
                        //书卷考查,专题系列,讲道信息,圣经一神论,生命再思
                    }
                },
                "type": {
                    "type": "string",
                    "enum": ["check","reload","update"]
                },
                "formats": {
                    "type": "array",
                    "item": {
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