'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Base = require('koa2frame').external;

class cls extends Base {
    constructor () {
        super('fydt');
    }
}

cls.prototype.getResourcePage = async function (url) {
    let html = await this.get(url),infos = [];

    if(html.indexOf('<tbody>') > -1) html = html.slice(html.indexOf('<tbody>'),html.indexOf('</tbody>'));
    html.slice(html.indexOf('<tr'),html.lastIndexOf('</tr>'))
        .replace(/\<tr.*\>/g,'').split('</tr>')
        //.slice(44,46)
        .map(tr => {
            if(!tr) return;
            let trr = tr.split('</td>');
            trr.shift();
            trr.pop();
            infos.push([
                trr[0].split('</a>')[0].split('>').slice(-1)[0].replace('?','？').replace(/(^\s*)|(\s*$)/g, '')
                + `-${trr[1].replace(/ /g, '').split('\n').slice(-1)}`
            ]);
            trr.slice(2).map(res => {
                let href_arr = res.split('href="');
                if(href_arr.length < 2) return;
                href_arr.map((item,i) => {
                    if(i == 0) return;
                    let url = item.split('"')[0],
                        res_name = url.split('/').slice(-1)[0].split('?')[0];
                    infos[infos.length-1].push([res_name, url]);
                });
            });
        });
    return infos;
};

cls.prototype.getSecondCatalogue = async function (url) {
    let html = await this.get(url),infos = [];

    if(html.indexOf('<div') > -1) html = html.split('<div class="item-list">')[1].split('</div>')[0];
    html.replace('<ul>','').replace('</ul>','')
        .replace(/\<li.*href/g,'').replace(/\<\/a>\<\/li>\n/g,'')
        .split('="/cat/')
        .map(tr => {
            if(!tr) return;
            infos.push(tr.split('">'));
        });

    return infos;
};