'use strict';
/**
 * Created by Jesn on 20201/2/24.
 *
 */

const Fs = require('fs'),
    Queue = require('./queue'),
    Bornforlove = require('../external/bornforlove');

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
         "http://mpvideo.qpic.cn/0bf2nqaagaaaieadthaxhjpfa3gdanwaaaya.f10002.mp4?dis_k=30c21564a03fa186efb8535888848950&dis_t=1614147258",
        "D:\\back\\mine\\bible\\资料\\bornforlove/动画/【圣经工程】路加福音 | 路加福音 1-2.mp4"
     ]
 ]
 */
cls.prototype.check = function (resources,reload) {
    return resources.map(res => {
        if(!res) return;
        const url = res[1];
        const save = res[0];
        if(!url || !save) return;
        if (reload
            || !Fs.existsSync(save)
            || (Fs.statSync(save).size <1000)
        ) return [url,save];
    }).filter(x=>x);
};

/**
 *
 * @param catalogues
 * @param save_path
 * @returns {Array}
 * [
     [
        "http://mpvideo.qpic.cn/0bf2nqaagaaaieadthaxhjpfa3gdanwaaaya.f10002.mp4?dis_k=30c21564a03fa186efb8535888848950&dis_t=1614147258",
        "D:\\back\\mine\\bible\\资料\\bornforlove/动画/【圣经工程】路加福音 | 路加福音 1-2.mp4"
     ]
 ]
 */
cls.prototype.getResourceList = async function (catalogues,save_path,cache) {
    const back = [];
    for(let name of catalogues.values()) {
        const cat = Bornforlove.catalogues[name];
        const type_info = Object.assign({name}, cat);
        const result = await circle(type_info,save_path,cache);
        if (type_info && result) back.push(...result);
    }
    return back;

    async function circle (type_info,save,cache) {
        let urls = type_info.url;
        if(!urls) return;
        if(urls.constructor != Array) urls = [urls];

        let name = type_info.name;
        save = save || '';
        if(name) save += `/${name}`;

        let type = type_info.type,
            resources = [];

        switch (type) {
            case Bornforlove.types.project_list:
            case Bornforlove.types.picture_list:
                if(!type_info.children) break;
                for(let url of urls.values()) {
                    const infos = await Bornforlove[type](url,cache);
                    const res_infos = await circle(Object.assign({
                        url: infos
                    },type_info.children),save,cache);
                    if(res_infos) resources.push(...res_infos);
                }
                break;
            case Bornforlove.types.project_detail:
            case Bornforlove.types.picture_detail:
                for(let url of urls.values()) {
                    const res_infos = await Bornforlove[type](url,cache);
                    resources.push(...res_infos.map(res_info => {
                        if(res_info) return [`${save}/${res_info[1]}`,res_info[0]]
                    }));
                }
                break;
        }

        return resources.filter(x=>x);
    }
};

module.exports = new cls();