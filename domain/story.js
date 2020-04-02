'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Fs = require('fs'),
    Ut = require('../tool/utils'),
    Queue = require('./queue'),
    Story = require('../external/520story');

class cls {
    constructor () {}
}

cls.prototype.async520 = async function (url,save,reload) {
    let list = await this.check520(url,save,reload);
    if(!list.length) return;
    await Queue.create(list);
    Queue.start(Story);
};

cls.prototype.check520 = async function (url,save,reload) {
    let back = [];

    (await Story.resource_list(url)).map((info,i) => {
        let str = i+1;
        if (str < 10) str = '00' + str;
        else if (str < 100) str = '0' + str;

        let path = save + info[0].split('_')[0] + '/';
        let id = Ut.fixFileName(info[0]);
        id = path + id.replace(/第[0-9]*[集|章]/,str).replace(/第[一-十|四]*[集|章]/,str);
        let id_mp3 = id.slice(0,id.lastIndexOf('.'))+'.mp3';

        if (reload || (
                (!Fs.existsSync(id) || (Fs.statSync(id).size <3000))
                && (!Fs.existsSync(id_mp3) || (Fs.statSync(id_mp3).size <3000))
            )
        ) back.push({
            id: id,
            url: encodeURI(unescape(info[1].replace(/\\/g, "%")))
        });
    });

    return back;
};

module.exports = new cls();