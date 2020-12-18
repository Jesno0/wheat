'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Base = require('koa2frame').api,
    Fs = require('fs'),
    File = require('../domain/file');

class cls extends Base{
    constructor () {
        super('file');
        this.formats = {
            doc: "文档",
            audio: "音频",
            video: "视频",
            other: "其他"
        };
        this.types = {
            check: "检测",
            update: "下载更新",
            reload: "重新下载"
        };
        this.sorts = {
            name: "名称",
            size: "大小",
            birthtimeMs: "创建时间",
            mtimeMs: "修改时间"
        };
        this.sort_types = {
            asc: "升序",
            desc: "降序"
        };
    }
}

let instance = new cls();

cls.prototype.sync = async function (ctx) {
    let body = ctx.request.body,
        type = body.type,
        formats = body.formats,
        url = body.url,
        save_path = body.save,
        is_dir = Boolean(parseInt(body.is_dir)),
        is_reload = Boolean(type=='reload');
    if(save_path.slice(save_path.length-1) != '/')
        save_path += '/';

    switch (type) {
        case 'check':
            return File.check(url,save_path,is_reload,is_dir,formats);
        case 'update':
        case 'reload':
        default:
            return File.async(url,save_path,is_reload,is_dir,formats);
    }
};
cls.prototype.sync.settings = {
    params: {
        is_filter: true,
        body: {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string"
                },
                "save": {
                    "type": "string"
                },
                "type": {
                    "enum": Object.keys(instance.types)
                },
                "is_dir": {
                    "enum": [0,1,"0","1"]
                },
                "formats": {
                    "type": "array",
                    "items": {
                        "enum": Object.keys(instance.formats)
                    }
                }
            },
            "required":["url","save","formats"]
        }
    }
};

cls.prototype.init = async function () {
    return {
        formats: Object.keys(instance.formats).map(id => {
            return {
                id,
                name: instance.formats[id]
            }
        }),
        types: Object.keys(instance.types).map(id => {
            return {
                id,
                name: instance.types[id]
            }
        }),
        sorts: Object.keys(instance.sorts).map(id => {
            return {
                id,
                name: instance.sorts[id]
            }
        }),
        sort_types: Object.keys(instance.sort_types).map(id => {
            return {
                id,
                name: instance.sort_types[id]
            }
        }),
    }
};

cls.prototype.catalogue = async function (ctx) {
    let body = ctx.request.body,
        type = body.type,
        url = body.url,
        sort = body.sort,
        sort_type = body.sort_type,
        save_path = (body.save || body.url) + `/目录.txt`,
        list = File.dirList(url,sort,sort_type);

    switch (type) {
        case 'update':
        case 'reload':
            Fs.writeFileSync(save_path, File.writeCatalogue(list));
        case 'check':
        default:
            return list;            
    }
};
cls.prototype.catalogue.settings = {
    params: {
        is_filter: true,
        body: {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string"
                },
                "save": {
                    "type": "string"
                },
                "type": {
                    "enum": Object.keys(instance.types)
                },
                "sort": {
                    "enum": Object.keys(instance.sorts)
                },
                "sort_type": {
                    "enum": Object.keys(instance.sort_types)
                }
            },
            "required":["url"]
        }
    }
};

module.exports = new cls();