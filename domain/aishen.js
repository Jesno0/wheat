'use strict';
/**
 * Created by Jesn on 2020/4/1.
 *
 */

const Fs = require('fs'),
    Ut = require('../tool/utils'),
    Queue = require('./queue'),
    AiShen = require('../external/aishen'),
    AiShenFile = require('../external/aishenFile');

class cls {
    constructor () {}
}

cls.prototype.async = async function (check_list) {
    let len = check_list.length;
    if(!len) return;

    await Queue.create(check_list.map(item => {
        return {
            id: item[1],
            url: item[0]
        }
    }));
    Queue.start();
};

/**
 *
 * @param resources
 * @param formats
 * @param reload
 * @returns {Array}
 * [
     [
         'https://www.fydt.org/sites/default/files/book/ebooks/Gdkn_testimony_updated.pdf',
         'F:/1_back/mine/bible/书籍推介/一生一世必有恩惠慈爱与我同在-周慧贤.pdf',
     ]
 ]
 */
cls.prototype.check = function (resources,formats,reload) {
    let back = [];

    for(let i=0; i<resources.length; i++) {
        let res = resources[i],
            url = res[1],
            save = res[0],
            ext = save.slice(save.lastIndexOf('.')+1);
        if (formats.indexOf(ext) < 0) continue;

        if (reload
            || !Fs.existsSync(save)
            || (Fs.statSync(save).size <1000)
        ) back.push([url, save]);
    }

    return back;
};

/**
 *
 * @param catalogues
 * @param save_path
 * @returns {Array}
 * [
     [
        'F:/1_back/mine/bible/book/aishen/神学书籍/福音真理/基督教要义-约翰·加尔文.txt',
        'http://u232.161-ctc-dd.tv002.com/down/2e077642fdf2dffb02566d3a7b5c9e91/104_christianity.txt?cts=dx-f-D61A140A60A173Fd41d8&ctp=61A140A60A173&ctt=1585746424&limit=1&spd=1550000&ctk=2e077642fdf2dffb02566d3a7b5c9e91&chk=9c5172aea0b72a4cd9593ad0349f200b-2361207&mtd=1'
     ]
 ]
 */
cls.prototype.getResourceList = async function (catalogues,save_path,is_cache) {
    const back = [];
    for(let name of catalogues) {
        const cat = AiShen.catalogues[name];
        let type_info = Object.assign({name}, cat);
        if (type_info) back.push(...(await circle(type_info,save_path,is_cache)));
    }
    return back;

    async function circle (type_info,save,is_cache) {
        let urls = type_info.url;
        if(!urls) return;
        if(urls.constructor != Array) urls = [urls];

        let name = type_info.name;
        save = save || '';
        if(name) save += `/${name}`;

        const type = type_info.type,
            resources = [];

        switch (type) {
            case AiShen.types.resource_list:
                if(!type_info.children) break;
                for(let url of urls) {
                    const infos = await AiShen[type](url,null,is_cache);
                    const res_infos = await circle(Object.assign({
                        url: infos
                    },type_info.children),save,is_cache);
                    if(res_infos) resources.push(...res_infos);
                }
                return resources;
            case AiShen.types.resource_id:
                for(let info of urls) {
                    const types = await AiShen[type](info.url,null,is_cache);
                    for(let [index,type] of types.entries()) {
                        const file_chk = (await AiShenFile.resource_detail(type.uid,type.fid,info.cat,is_cache).catch(err => {
                            if ([503,21].includes(err.ok)) return {};
                            return Promise.reject({info,error:err});
                        })).file_chk;
                        if(!file_chk) continue;
                        const link = (await AiShenFile.file_url(type.uid,type.fid,file_chk,is_cache).catch(err => {
                            if ([503,215,21].includes(err.ok)) return {};
                                return Promise.reject({info,error:err});
                            })).downurl;

                        if(link) resources.push([
                            `${save}/${info.cat}/${Ut.fixFileName(info.name)}-${Ut.fixFileName(info.auth)}.${index?'pdf':'txt'}`,
                            link
                        ]);
                    }
                }
                return resources;
        }
    }
};

module.exports = new cls();