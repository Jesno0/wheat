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

    /**
     * 加入缓存写入
     * 根据etc配置设置是否写入缓存，根据this.cache值设置是否读取缓存值
     * @param method
     * @param api
     * @param info
     * @param back_format
     * @param err_msg
     * @param oks 设置可过滤的ok值，使其不会报错
     * @returns {*}
     */
    async request(method,api,info,back_format,err_msg,oks) {
        let file_path = '',name = '',root = '',back;
        if(this.info && this.info.cache) {
            name = (back_format == 'html')
                ? Ut.fixFileName(api)
                : crypto.createHash('md5').update(api+JSON.stringify(info)).digest("hex");
            if(name.indexOf('.html') < 0) name += '.html';
            root = Path.resolve(__dirname, `../view/cache/${this.name}`);
            file_path = `${root}/${name}`;
        }
        if (this.cache && Fs.existsSync(file_path)) {
            back = Fs.readFileSync(file_path, 'utf-8');
            if(back) {
                try { return JSON.parse(back);}
                catch (err) {return back;}
            }
        }

        back = await super.request(method, api, info, back_format, err_msg).catch(result => {
            if (oks && oks.indexOf(result.ok)>-1) return result.data;
            else if((result.ok == 503) && (result.msg == "require for verifycode")) return this.request(method,api,info,back_format,err_msg,oks);
            return Promise.reject(result);
        });
        if (this.info && this.info.cache && back) {
            Ut.mkdirs(root);
            if(back.constructor != String) Fs.writeFileSync(file_path, JSON.stringify(back));
            else Fs.writeFileSync(file_path, back);
        }
        return back;
    }
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