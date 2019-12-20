'use strict';
/**
 * Created by Jesn on 2019/12/18.
 *
 */

const Frame = require('koa2frame'),
    FydtExt = require('../external/fydt'),
    Err = Frame.error,
    Base = Frame.domain;

class cls extends Base{
    constructor() {
        super('fydt_queue');
        this.DbFunc = this.DB;
        this.status = false;
    }
}

cls.prototype.start = async function () {
    if(this.status) return;
    this.status = true;

    let info = this.DbFunc.findOne();
    if(!info) return;
    await FydtExt.downResource(info.url,info.id).catch(err => {
        this.status = false;
        return this.start();
    });

    let num = (await this.DbFunc.removeOne()).n;
    if(!num && (await this.find({})).length) return Err.log(Err.error_log_type.db,'fydt_queue删除失败，任务停止');

    this.status = false;
    await this.start();
};

cls.prototype.toFormat = function(model) {
    return model || {};
};

cls.prototype.toListFormat = function (model) {
    return this.toFormat(model);
};

module.exports = new cls();