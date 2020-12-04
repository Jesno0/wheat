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

exports.writeResponse = function(ctx, data, file_name){
    if(!data) return;

    const userAgent = (ctx.req.headers['user-agent']||'').toLowerCase();
    if(userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
        file_name = `filename=${encodeURIComponent(file_name)}`;
    } else if(userAgent.indexOf('firefox') >= 0) {
        file_name = `filename*="utf8\'\'${encodeURIComponent(file_name)}"`;
    } else {/* safari等其他非主流浏览器只能自求多福了 */
        file_name = `filename=${Buffer.from(file_name).toString('binary')}`;
    }

    ctx.res.writeHead(200, {
        'Accept-Ranges': 'bytes',
        'Content-Type': exports.getContentType(Path.parse(file_name).ext),
        'Content-Disposition': `attachment; ${file_name}`
    });
    ctx.res.end(data);
};

exports.getContentType = function(ext) {
    switch(ext.replace('.','')) {
        case 'xlsx':
        case 'xls':
            return 'application/x-excel';
        case 'm3u8':
        return 'application/vnd.apple.mpegurl';
    }
}


module.exports = new cls();