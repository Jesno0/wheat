'use strict';
/**
 * Created by Jesn on 2019/4/25.
 * 文件存放
 */

const cryptKey = '/u&i&he&she/';

const Fs = require('fs'),
    crypto = require('crypto'),
    Frame = require('koa2frame'),
    Err = Frame.error,
    Ut = Frame.utils,
    Etc = Ut.getEtc();

let Tv4;

class cls {
    constructor (name) {
        this.server = `${__dirname}/${name}.json`;
        this.name = name;
        this.is_log = Etc.log && Etc.log.db;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.db = require(`./${this.name}.json`);
            if(this.db.constructor != Array) {
                return Promise.reject(Err.get(Err.file_error,`${this.server}的格式应该为数组`));
            }
        }catch(err) {
            this.db = [];
            await this.updateDocument();
        }

        try {
            Tv4 = require('tv4');
        }catch(err) {
            return Promise.reject(Err.get(Err.etc_config,'缺少tv4库'));
        }

        return this;
    }
}

/**
 * 必须继承重写,传入 schema
 * @param opts
 * @param schema
 * @returns {*}
 */
cls.prototype.model = async function (opts,schema) {
    let result = Tv4.validateMultiple(opts,schema);
    if(result.valid) return opts;

    return Promise.reject(Err.get(Err.parameter_error,result.errors.map(error => {
        return {
            path: error.dataPath,
            msg: error.message,
            detail: error.params
        };
    })));
};

cls.prototype.create = async function (arr) {
    for(let i=0; i<arr.length; i++) {
        let opts = arr[i];
        await this.model(opts);

        let rec = await this.findById(opts.id);
        if(!rec) await this.db.push(opts);
        else Object.assign(this.db.find(item => {return item.id == opts.id}),opts);
    }

    await this.updateDocument();
    return this.db;
};

cls.prototype.remove = async function (condition) {
    let len = this.db.length,
        count = 0,
        i, flag, file;

    for(i = len-1 ;i > -1 ;i --) {
        flag = true;
        file = this.db[i];
        Object.keys(condition).map(k => {
            if (condition[k].constructor == RegExp){
                flag = file[k].match(condition[k]);
            } else if(condition[k] != file[k]) flag = false;
        });
        if(flag) {
            this.db.splice(i,1);
            count ++;
        }
    }

    await this.updateDocument();
    return {n:count};
};

cls.prototype.update = async function (condition,opts) {
    await this.model(opts);
    let files = this.find(condition,null,{origin:true}).map(file => {
        Object.keys(opts).map(k => {
            file[k] = opts[k];
        });
    });
    await this.updateDocument();

    return {n: files.length};
};

cls.prototype.find = function (condition,field,options) {
    let files = Ut.noRepeat(this.db.map(opts => {
        if(!options || !options.origin) opts = Object.assign({},opts);

        let flag = true;
        if(condition.constructor == Object && Object.keys(condition).length) {
            Object.keys(condition).map(k => {
                if (condition[k] && condition[k].constructor == RegExp){
                    flag = opts[k].match(condition[k]);
                } else if (condition[k] != opts[k]) flag = false;
            });
        }
        if(!flag) return;
        if(!field) return opts;

        let back = {};
        field.split(',').map(k => {
            back[k] = opts[k];
        });
        return back;
    }));

    let {sort,skip,limit} = options || {};
    if(sort) {
        files.sort((a,b) => {
            let flag = true;
            Object.keys(condition).map(k => {
                if(!flag && (
                    (condition[k] == 1 && a[k] > b[k]) ||
                    (condition[k] == -1 && a[k] < b[k])
                )) flag = false;
            });
            return flag;
        })
    }

    if(limit) {
        files = files.slice(skip,skip+limit);
    }

    return files;
};

cls.prototype.findById = function (id) {
    return this.find({id:id})[0];
};

cls.prototype.countDocuments = function (condition) {
    return this.find(condition).length;
};

cls.prototype.updateDocument = function () {
    return Fs.writeFileSync(this.server,JSON.stringify(this.db));
};

cls.prototype.encrypt = function (data) {
    const cipher = crypto.createCipher('aes192', cryptKey);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

cls.prototype.decrypt = function (encrypted) {
    const decipher = crypto.createDecipher('aes192', cryptKey);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

module.exports = cls;