'use strict';
/**
 * Created by Jesn on 2019/12/19.
 *
 */

const Base = require('./base');

class cls extends Base{
    constructor () {
        super('queue',Array);
    }

    async model (opts) {
        await super.model(opts,{
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    minLength: 1
                },
                url: {
                    type: 'string',
                    minLength: 1
                },
                status: {
                    type: 'string',
                    minLength: 1
                },
                create_at: {
                    type: Date
                }
            },required: ['url','id']
        });

        if(!opts.status) opts.status = 'normal';
        if(!opts.create_at) opts.create_at = new Date(Date.now() + 8 * 60 * 60 * 1000);

        return opts;
    }
}

cls.prototype.findNext = async function () {
    return (await this.find({status:'normal'}))[0];
};

cls.prototype.ban = async function (model) {
    model.status = 'ban';
    delete model.create_at;
    return this.update({id:model.id}, model);
}

module.exports = new cls();