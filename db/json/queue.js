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
                create_at: {
                    type: Date
                }
            },required: ['url','id']
        });

        if(!opts.create_at) opts.create_at = new Date(Date.now() + 8 * 60 * 60 * 1000);

        return opts;
    }
}

cls.prototype.findOne = function () {
    return this.db[0];
};

cls.prototype.removeOne = function () {
    return this.remove({id:this.db[0].id});
};

module.exports = new cls();