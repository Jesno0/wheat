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

cls.prototype.getType = function (ext) {
    if(ext.slice(0,1) == '.') ext = ext.slice(1);
    switch (ext) {
        case 'mp3':
        case 'wav':
        case 'avi':
            return 'audio';
        case 'mp4':
            return 'video';
        case 'doc':
        case 'docx':
        case 'xls':
        case 'xlsx':
        case 'pdf':
        case 'txt':
            return 'doc';
        default:
            return 'other';
    }
};


module.exports = new cls();