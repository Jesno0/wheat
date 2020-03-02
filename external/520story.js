'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Base = require('./base');

class cls extends Base {
    constructor() {
        super('520story');
    }

    async getHtml (url) {
        url = url.replace(this.server,'');
        return await super.request('get', url, {encoding: 'gb2312'}, 'html');
    }
}

cls.prototype.resource_list = async function (url) {
    //http://www.520tingshu.com/book/book854.html
    let html = await this.getHtml(url),
        title = html.split('baybox')[1].split('</h3>')[0].split('</a>').slice(-1)[0].replace(/&nbsp;/g,'').replace(/&raquo;/g,''),
        back = html.split('playurl')[2].split('<ul>')[1].split('</li></ul>')[0].split('</li>').map(item => {
            let name = item.split(`title='`)[1].split(`'`)[0],
                url = item.split(`href='`)[1].split(`'`)[0];
            return [name, url];
        }),res_list = await this.resource_detail(back[0][1]);

    return back.map((item,i) => {
        let res = res_list[i];
        return [
            title + '_' + item[0] + res.slice(res.lastIndexOf('.')),
            res_list[i]
        ];
    })
};

cls.prototype.resource_detail = async function (url) {
    //http://www.520tingshu.com/down/?854-0-0.html
    let html = await this.getHtml(url),
        js_url = html.split('</Center>')[1].split('">')[0].split('"')[1],
        js_html = await this.getHtml(js_url);

    return js_html.split('http').slice(1).map(item => {
        return `http${item.split('$')[0]}`;
    });
};

cls.prototype.thunder = async function (url) {
    //http://www.520tingshu.com/xunleidown/?id=854%26vid=0%26pid=0
    let html = await this.getHtml(url);
    return html.split('thunderHref="')[1].split('"')[0];
};

module.exports = new cls();