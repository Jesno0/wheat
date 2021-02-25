'use strict';
/**
 * Created by Jesn on 2020/4/1.
 *
 */

const Base = require('./base');

class cls extends Base {
    constructor() {
        super('aishenFile');

        this.types = {
            resource_detail: 'resource_detail',
            file_url: 'file_url'
        };
    }

    async request(method,api,info,back_format,err_msg) {
        return super.request(method, api, info, back_format, err_msg, ['1', 200]);
    }
}

cls.prototype.resource_detail = async function (uid,fid,ref,is_cache) {
    const url = '/getfile.php';
    const _this = this;
    return this.orCache(is_cache, url, {uid,fid,ref}, async function() {
        //https://webapi.ctfile.com/getfile.php?f=1210232-395746725&passcode=&r=0.547137591339367&ref=http://www.aishen360.com/download/fragrance-of-myrrh.html
        return _this.request('get',url, {
            headers: {
                Origin: 'http://down.aishen360.com'
            }, query: {
                f: `${uid}-${fid}`,
                passcode: '',
                //r: Math.random(), //todo: 无法 cache
                ref: `http://www.aishen360.com/download/${ref}.html`
            }
        });
    });
};

cls.prototype.file_url = async function (uid,fid,file_chk,is_cache) {
    const url = '/get_file_url.php';
    const _this = this;
    return this.orCache(is_cache, url, {uid,fid,file_chk}, async function() {
        //https://webapi.ctfile.com/get_file_url.php?uid=1210232&fid=412121168&folder_id=0&file_chk=c437ac9ef11502a3fa6fd4657d7d4f6e
        return _this.get(url, {
            uid,
            fid,
            file_chk,
            folder_id:0
        });
    });
};

module.exports = new cls();