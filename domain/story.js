'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Fs = require('fs'),
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
        let id = save + info[0].replace(/第[0-9]*集/,str);

        if (reload
            || !Fs.existsSync(id)
            || (Fs.statSync(id).size <1)
        ) back.push({
            id: id,
            url: info[1]
        });
    });

    return back;
};

module.exports = new cls();