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
        return super.request(method, api, info, back_format, err_msg).catch(err => {
            if(err && ['1',200].includes(err.ok)) return err.data;
            else return Promise.reject(err);
        });
    }
}

cls.prototype.resource_detail = async function (uid,fid,ref,is_cache) {
    const url = '/getfile.php';
    const _this = this;
    return this.orCache(is_cache, `${url}::${uid}_${fid}_${ref}`, null, async function() {
        //https://webapi.ctfile.com/getfile.php?f=1210232-395746725&passcode=&r=0.547137591339367&ref=http://www.aishen360.com/download/fragrance-of-myrrh.html
        const data = await _this.request('get',url, {
            headers: {
                Origin: 'http://down.aishen360.com'
            }, query: {
                f: `${uid}-${fid}`,
                passcode: '',
                r: Math.random(),
                ref: `http://www.aishen360.com/download/${ref}.html`
            }
        });

        return {
            file_chk: data.file_chk
        }
    });
};

cls.prototype.file_url = async function (uid,fid,file_chk,is_cache) {
    const url = '/get_file_url.php';
    const _this = this;
    return this.orCache(is_cache, `${url}::${uid}_${fid}_${file_chk}`, null, async function() {
        //https://webapi.ctfile.com/get_file_url.php?uid=1210232&fid=412121168&folder_id=0&file_chk=c437ac9ef11502a3fa6fd4657d7d4f6e
        const data = await _this.request('get', url, {
            query: {
                uid,
                fid,
                file_chk,
                folder_id:0
            }
        }).catch(err => {
            if(err.ok !== 503) return Promise.reject(err);
            return setTimeout(()=>{
                return _this.file_url(uid,fid,file_chk,is_cache);
            },200);
        });

        return {
            downurl: data.downurl 
        }
    });
};

module.exports = new cls();