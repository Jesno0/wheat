'use strict';
/**
 * Created by Jesn on 2021/2/24.
 *
 */

const Base = require('./base');

class cls extends Base {
    constructor() {
        super('bornforlove');

        this.types = {
            project_list: 'project_list',
            project_detail: 'project_detail',
            picture_list:  'picture_list',
            picture_detail:  'picture_detail'
        };

        this.catalogues = {
            "动画述经": {
                type: this.types.project_list,
                url: '/s/wd4R_Wy03FFlqbPXxHgMaA',
                children: {
                    type: this.types.project_detail
                }
            },"图表述经": {
                type: this.types.picture_list,
                url: '/s/ZH0B1BXczWfYnWqOdEJPpg',
                children: {
                    type: this.types.picture_detail
                }
            }
        };
    }

    async getHtml (url) {
        url = url.replace(this.server,'');
        return super.get(url, null, 'html');
    }
}

cls.prototype.project_list = async function(url,is_cache) {
    const _this = this;
    return this.orCache(is_cache, url, null, async function() {
        const html = await _this.getHtml(url,is_cache);
        return html.split('圣经工程简介')[1].split('</div>')[0].split('rich_pages')[0].split('href="').slice(1).map(item => {
            return item.split('"')[0].replace(/amp;/g,'').replace(_this.info.url_bak,'');
        });
    });
};

cls.prototype.project_detail = async function(url,is_cache) {
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
}

cls.prototype.picture_list = async function (url,is_cache) {
    const _this = this;
    return this.orCache(is_cache, url, null, async function() {
        const html = await _this.getHtml(url,is_cache);
        return html.split('id="js_content"')[1].split('</div>')[0].split('rich_pages')[1].split('href="').slice(1).map(item => {
            return item.split('"')[0].replace(/amp;/g,'').replace(_this.info.url_bak,'');
        });
    });
};

cls.prototype.picture_detail = async function (url,is_cache) {
    const _this = this;
    return this.orCache(is_cache, `picture_detail::${url}`, null, async function() {
        const html = await _this.getHtml(url,is_cache);
        const title_arr = html.split('id="activity-name"')[1].split('>')[1].split('<')[0].split('《')[1].split('》');
        const key = title_arr[1].slice(0,1);
        
        let title = title_arr[0];
        if(['上','中','下'].includes(key)) title = `${title}-${key}`;

        return html.split('id="js_content"')[1].split('</div>')[0].split('Copyright')[0].split('src="').slice(1).map((item,i) => {
            let num = String(i+1);
            while(num.length < 3) {
                num = `0${num}`;
            }
            return [
                item.split('"')[0],
                `${title}/${title}_${num}.jpg`
            ];
        });
    });
};

module.exports = new cls();