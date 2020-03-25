'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Base = require('koa2frame').api,
    Queue = require('../domain/queue');

class cls extends Base{
    constructor () {
        super();
    }
}

cls.prototype.list = async function (ctx) {
    let id = ctx.query.id;
    if(id) ctx.query.id = new RegExp(id);
    return Object.assign({
        status: Queue.status
    },await Queue.list(ctx.query));
};
cls.prototype.list.settings = {
    params: {
        is_filter: true,
        query: {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string"
                }
            },
            "required":[]
        }
    }
};

cls.prototype.remove = function (ctx) {
    return Queue.delete({id:new RegExp(ctx.query.id)});
};
cls.prototype.remove.settings = {
    params: {
        is_filter: true,
        query: {
            "type": "object",
            "properties": {
                "id": {
                    "type": "string",
                    "minLength": 1
                }
            },
            "required":["id"]
        }
    }
};

module.exports = new cls();