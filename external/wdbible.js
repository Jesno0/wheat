'use strict';
/**
 * Created by Jesn on 2021/3/3.
 *
 */

const Base = require('./base');

class cls extends Base {
    constructor() {
        super('wdbible');

        this.types = {
            note_list: 'note_list'
        };

        this.catalogues = {
            "笔记": {
                type: this.types.note_list,
                url: '/note/list'
            }
        };
    }

    async getHtml (url) {
        url = url.replace(this.server,'');
        return super.get(url, null, 'html');
    }

    async request (method, api, info, back_format, err_msg ) {
        return super.request(method,api,info,back_format, err_msg).catch(err => {
            if(err && err.errno === 200) return err.data;
            else return Promise.reject(err);
        });
    }
}

cls.prototype.note_list = async function(url,cookie,is_cache) {
    const _this = this;
    return this.orCache(is_cache, url, {cookie}, async function() {
        await _this.request('post', '/sync/download',{
            headers: {cookie}
        });

        let page = 1;
        const result = await nlist(page);
        const back = toFormat(result.list);
        const total = result.total;
        for(let i=total-20; i >0 ; i=i-20) {
            const _result = await nlist(++page);
            back.push(...toFormat(_result.list));
        }
        return back;
    });

    async function nlist (_page) {
        // return _this.orCache(is_cache, url, {cookie,page: _page}, async function() {
        return _this.request('get', url, {
            headers: {cookie},
            query: {
                page: _page,
                orderField: 'create_time',
                sort: 'desc'
            }
        });
    // });
    }

    function toFormat (_list) {
        return _list.map(item => {
            return {
                title: item.noteTitle,
                content: item.noteContent,
                createTime: item.createTime,
                updateTime: item.lastUpdateTime,
                references: (item.verseInfo || []).map(ver => {
                    return ver.verseTitle;
                })
            }
        })
    }
};

cls.prototype.note_detail = async function(url,is_cache) {
    const _this = this;
    return this.orCache(is_cache, `project_detail::${url}`, null, async function() {
        const html = await _this.getHtml(url,is_cache);
        const vid = html.split('</iframe>')[0].split('<iframe')[1].split('data-src')[1].split('vid=')[1].split('"')[0];
        const result = await _this.get('/mp/videoplayer',{
            action: 'get_mp_video_play_url',
            vid
        });
        const url_info = result.url_info[0];
        return [url_info && [url_info.url, `${result.title}.mp4`]];
    });
};

cls.prototype.login = async function (uid, psw) {
    const cid = await this.getCaptcha();
    const Axios = require('axios');
    const back = await Axios.post(`${this.server}/user/login`,{
        uid,
        psw,
        cid
    });
    return back.data;
};

cls.prototype.getCaptcha = async function () {
    const html = await this.getHtml('/system/captcha?t=get_html');
    const cid = html.split(`window.cid`)[1].split(';')[0].replace(/'/g,'').replace(/"/g,'').replace(/=/g,'').replace(/ /g,'');

    const is_check = await this.get('/system/captcha',{
        t: 'check',
        captchaId: cid,
        // offset: 30//无法计算 offset ，做弃用。
    });

    return cid;
};

module.exports = new cls();