'use strict';
/**
 * Created by Jesn on 2019/12/18.
 *
 */

const Frame = require('koa2frame'),
    Fs = require('fs'),
    Path = require('path'),
    ExternalCls = require('../external/base'),
    Ut = require('../tool/utils'),
    Err = Frame.error,
    Base = Frame.domain;

class cls extends Base{
    constructor() {
        super('queue');
        this.DbFunc = this.DB;
        this.status = false;
        this.stop = false;
    }

    toCondition (opts) {
        let condition = super.toCondition(opts);
        if(condition._id) {
            condition.id = condition._id;
            delete condition._id;
        }
        return condition;
    }
}

cls.prototype.start = async function () {
    if(this.status) return;
    this.status = true;
    this.stop = false;

    const info = this.DbFunc.findOne();
    if(!info) return this.status = false;

    if(info.url.indexOf('http') == 0)
        await ExternalCls.downResource(info.url,info.id).catch(err => {
            this.status = false;
            return Promise.reject(err);
        });
    else await writeFile(info.id,info.url).catch(err => {
        this.status = false;
        return Promise.reject(err);
    });

    this.status = false;

    const remove_num = (await this.DbFunc.removeOne()).n;
    if(!remove_num) return Err.log(Err.error_log_type.db,'fydt_queue删除失败，任务停止');

    if(this.stop) return this.stop = false;

    const list_num = (await this.count({}));
    if(list_num) await this.start();
};

cls.prototype.toFormat = function(model) {
    return model || {};
};

cls.prototype.toListFormat = function (model) {
    return this.toFormat(model);
};

module.exports = new cls();

function writeFile(path,data) {
    Ut.mkdirs(Path.dirname(path));
    return new Promise((resolve,reject) => {
        if(Fs.lstatSync(data).isFile()) {
            Fs.createReadStream(data)
                .on('data', thuck => {console.log('req data',thuck)})
                .pipe(Fs.createWriteStream(path))
                .on('error', err => {
                    Err.log(Err.error_log_type.http,data,path,err);
                    if(Fs.existsSync(path)) Fs.unlinkSync(path);
                    reject();
                })
                .on('close', err => {
                    if(err) {
                        Err.log(Err.error_log_type.http,data,path,err);
                        if(Fs.existsSync(path)) Fs.unlinkSync(path);
                        reject();
                    }
                    else resolve();
                });
        } else {
            Fs.writeFile(path,data,err => {
                if(err) {
                    Err.log(Err.error_log_type.http,data,path,err);
                    if(Fs.existsSync(path)) Fs.unlinkSync(path);
                    reject();
                }
                else resolve();
            });
        }
    });
}