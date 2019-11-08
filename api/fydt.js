'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Base = require('./base');
import Fydt from '../domain/fydt';

class cls extends Base{
    constructor () {
        super();
    }
}

cls.prototype.sync = async function (ctx) {
    return Fydt.sync(ctx.query);
};
cls.prototype.index.settings = {
    params: {
        is_filter: true,
        query: {
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