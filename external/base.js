'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Frame = require('koa2frame'),
    FrameUt = Frame.utils,
    Etc = FrameUt.getEtc(),
    IS_LOG = Etc.log && Etc.log.external,
    Err = Frame.error,
    Request = require('request'),
    Fs = require('fs'),
    Path = require('path'),
    crypto = require('crypto'),
    Ut = require('../tool/utils'),
    Base = Frame.external;

class cls extends Base {
    constructor(name) {
        super(name);
        this.cache = this.info && this.info.cache; //可在程序中设置
    }
}

cls.prototype.orCache = async function(is_cache,url,params,getDataFunc) {
    let data;
    is_cache = FrameUt.isValue(is_cache) ? is_cache : this.cache;
    if(is_cache) data = this.getCache(url,params);
    if(data) return data;

    data = await getDataFunc();
    if(this.cache) this.saveCache(url,params,data);
    return data;
}

cls.prototype.saveCache = function (url,params,data) {
    if(!FrameUt.isValue(data)) return;
    try {JSON.stringify(data);}catch(err) {return};

    const {file_path,info_key} = this.getCachePath(url,params);
    if(!info_key) {
        Fs.writeFileSync(file_path, JSON.stringify(data));
    } else {
        const content = Fs.existsSync(file_path) ? JSON.parse(Fs.readFileSync(file_path, 'utf-8')) : {};
        content[info_key] = data;
        Fs.writeFileSync(file_path, JSON.stringify(content));
    }
}

cls.prototype.getCache = function (url,params) {
    const {file_path,info_key} = this.getCachePath(url,params);

    const content = Fs.existsSync(file_path) && Fs.readFileSync(file_path, 'utf-8');
    if(FrameUt.isValue(content)) {
        try { 
            const data = JSON.parse(content);
            return FrameUt.isValue(info_key) ? data[info_key] : data;
        }
        catch (err) {}
    }
}

cls.prototype.getCachePath = function (url,params) {
    const root = Path.resolve(__dirname, `../view/cache/${this.name}`);
    Ut.mkdirs(root);

    const url_info = url.split('::');
    let file_name = Ut.fixFileName(url_info[0]);
    if(params) file_name += crypto.createHash('md5').update(JSON.stringify(params)).digest("hex")
    file_name += '.json';

    return {
        file_path: `${root}/${file_name}`,
        info_key: url_info[1] && Ut.fixFileName(url_info[1])
    };
}

cls.downResource = async function (url,save) {
    if(IS_LOG) console.log(`【PIPE】: ${save} ${url}`);

    Ut.mkdirs(Path.dirname(save));
    return new Promise((resolve,reject) => {
        Request(url)
        //.on('data', thuck => {if(IsLog) console.log('req data',thuck)})
        //.on('close', err => {console.log('req close')})
            .on('error', err => {return reject(err);})
            .pipe(Fs.createWriteStream(save)
                .on('error', err => {return reject(err);})
                .on('close', err => {
                    if (err) return reject(err);
                    if(IS_LOG && Fs.existsSync(save)) console.log(`【EXTERNAL BACK】: ${save} ${Fs.statSync(save).size}`);
                    return resolve();
                }));
    }).catch(err => {
        Err.log(Err.error_log_type.http,url,save,err);
        if(Fs.existsSync(save)) Fs.unlinkSync(save);
        return Promise.reject(err);
    });
};

module.exports = cls;