'use strict';
/**
 * Created by Jesn on 2019/12/18.
 *
 */

const Frame = require('koa2frame'),
    Fs = require('fs'),
    Err = Frame.error,
    Base = Frame.domain;

class cls extends Base{
    constructor() {
        super('fydt_queue');
        this.DbFunc = this.DB;
        this.status = false;
    }
}

cls.prototype.start = async function (ExtCls) {
    if(this.status) return;
    this.status = true;

    let info = this.DbFunc.findOne();
    if(!info) return;

    if(info.url.indexOf('http') == 0)
        await ExtCls.downResource(info.url,info.id).catch(err => {
            this.status = false;
            return Promise.reject(err);
        });
    else await writeFile(info.id,info.url).catch(err => {
        this.status = false;
        return Promise.reject(err);
    });

    this.status = false;

    let remove_num = (await this.DbFunc.removeOne()).n;
    if(!remove_num) return Err.log(Err.error_log_type.db,'fydt_queue删除失败，任务停止');

    let list_num = (await this.count({}));
    if(list_num) await this.start(ExtCls);
};

cls.prototype.toFormat = function(model) {
    return model || {};
};

cls.prototype.toListFormat = function (model) {
    return this.toFormat(model);
};

module.exports = new cls();

function writeFile(path,data) {
    return new Promise((resolve,reject) => {
        Fs.writeFile(path,data,err => {
            if(err) reject();
            else resolve();
        });
    });
}