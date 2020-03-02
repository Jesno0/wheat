'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Frame = require('koa2frame'),
    Err = Frame.error,
    Request = require('request'),
    Fs = require('fs'),
    Base = Frame.external;

class cls extends Base {
    constructor(name) {
        super(name);
    }
}

cls.prototype.downResource = async function (url,save) {
    if(this.is_log) console.log(`【PIPE】: ${save} ${url}`);
    return new Promise((resolve,reject) => {
        Request(url)
        //.on('data', thuck => {if(this.is_log) console.log('req data',thuck)})
        //.on('close', err => {console.log('req close')})
            .on('error', err => {return reject(err);})
            .pipe(Fs.createWriteStream(save)
                .on('error', err => {return reject(err);})
                .on('close', err => {
                    if (err) return reject(err);
                    if(this.is_log && Fs.existsSync(save)) console.log(`【EXTERNAL BACK】: ${save} ${Fs.statSync(save).size}`);
                    return resolve();
                }));
    }).catch(err => {
        Err.log(Err.error_log_type.http,url,save,err);
        if(Fs.existsSync(save)) Fs.unlinkSync(save);
        return Promise.reject(err);
    });
};

module.exports = cls;