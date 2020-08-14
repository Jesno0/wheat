'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Fs = require('fs'),
    Ut = require('../tool/utils'),
    Queue = require('./queue'),
    Ximalaya = require('../external/ximalaya'),
    TingShu520 = require('../external/520story');

class cls {
    constructor () {}
}

cls.prototype.async = async function (url,save,reload) {
    const {external} = this.getUrlType(url);
    const list = await this.check(url,save,reload);
    if(!list.length) return;

    await Queue.create(list);
    Queue.start(external);
}

cls.prototype.check = async function (url,save,reload) {
    const {check:_check} = this.getUrlType(url);
    return _check(url,save,reload);
};

cls.prototype.check520 = async function (url,save,reload) {
    const back = [];

    (await TingShu520.resource_list(url)).map((info,i) => {
        let str = i+1;
        if (str < 10) str = '00' + str;
        else if (str < 100) str = '0' + str;

        const path = save + info[0].split('_')[0] + '/';
        let id = Ut.fixFileName(info[0]);
        id = path + id.replace(/第[0-9]*[集|章]/,str).replace(/第[一-十|四]*[集|章]/,str);
        const id_mp3 = id.slice(0,id.lastIndexOf('.'))+'.mp3';

        if (reload || (
                (!Fs.existsSync(id) || (Fs.statSync(id).size <3000))
                && (!Fs.existsSync(id_mp3) || (Fs.statSync(id_mp3).size <3000))
            )
        ) back.push({
            id,
            url: encodeURI(unescape(info[1].replace(/\\/g, "%")))
        });
    });

    return back;
};

cls.prototype.checkXimalaya = async function (url,save,reload) {
    const back = [];
    const arr = await Ximalaya.resource_list(url);
    
    for(let info of arr.values()) {
        const detail = await Ximalaya.resource_detail(info[1]);
        const ext = detail.slice(detail.lastIndexOf('.'));
        const paths = info[0].split('_');
        const id = save + Ut.fixFileName(paths[0]) + '/' +  Ut.fixFileName(paths[1]) + ext;
        
        if (reload || (!Fs.existsSync(id) || (Fs.statSync(id).size <3000))
        ) back.push({
            id,
            url: detail
        });
    }

    return back;
};

cls.prototype.getUrlType = function (url) {
    const external = [Ximalaya,TingShu520].find(clss => {return url.includes(clss.server);});
    let check;
    switch(external) {
        case Ximalaya:
            check = this.checkXimalaya;
            break;
        case TingShu520:
            check = this.check520;
            break;
    }
    return {external,check};
}

module.exports = new cls();