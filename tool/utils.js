'use strict';
/**
 * Created by Jesn on 2020/3/25.
 *
 */

const Fs = require('fs');
const Path = require('path');

class cls {
    constructor() {}
}

cls.prototype.mkdirs = function(dirpath) {
    if(Fs.existsSync(dirpath)) return;
    if (!Fs.existsSync(Path.dirname(dirpath))) {
        this.mkdirs(Path.dirname(dirpath));
    }
    Fs.mkdirSync(dirpath);
};

cls.prototype.fixFileName = function (title) {
    [':','\\\\','\/','\\?','\\*','\\"','<','>','\\|'].map(reg => {
        title = title.replace(new RegExp(reg,'g'),'_');
    });
    return title;
};

module.exports = new cls();