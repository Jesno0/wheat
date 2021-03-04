'use strict';
/**
 * Created by Jesn on 20201/2/24.
 *
 */

const Fs = require('fs'),
    Path = require('path'),
    Officegen = require('officegen'),
    Frame = require('koa2frame'),
    {getDate} = Frame.utils,
    Ut = require('../tool/utils'),
    Queue = require('./queue'),
    Wdbible = require('../external/wdbible');

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
        "D:\back\mine\bible\资料\wdbible/笔记/微读圣经笔记.docx",
        [{
            "title": "那鸿书结构-Jesn",
            "content": "主旨:审判尼尼微（亚述）\n\n背景:\n1. 时间：约拿传道，尼尼微悔改150年后；\n2. 悔改几十年后掳走了加利利，约旦河东居民，以色列北国；\n3. 西希家期间进攻南国，天使解围，神审判，被巴比伦所灭；\n4. 尼尼微是亚述的首都，为宁禄所建。\n\n主要内容\n 鸿1 神审判原则；毁灭尼尼微，拯救犹太人\n 鸿2 尼尼微被毁的细节\n 鸿3 尼尼微的恶，无论如何抵抗终为徒劳。",
            "createTime": 1614557133000,
            "updateTime": 1614741114000,
            "references": ["那鸿书 1:1"]
        }]
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

cls.prototype.writeNote = function(check_list) {
    for( let res_info of check_list) {
        const save_path = res_info[0];
        const resources = res_info[1];
        if(Fs.existsSync(save_path)) Fs.unlinkSync(save_path);
        else Ut.mkdirs(Path.dirname(save_path));

        const docx = Officegen({
            type: 'docx'
        });
        const time_format = 'yyyy-MM-dd hh:mm:ss';
        resources.map(res => {
            const page = docx.createP();
            page.addText(res.title, {
                font_face: '微软雅黑',
                bold: true,
                font_size: 13
            });
            page.addLineBreak();
            page.addText(`创建时间：${getDate(res.createTime).format(time_format)}`, {
                font_face: '微软雅黑',
                italic: true
            });
            page.addLineBreak();
            page.addText(`修改时间：${getDate(res.createTime).format(time_format)}`, {
                font_face: '微软雅黑',
                italic: true
            });
            page.addLineBreak();
            page.addText(`参考经文：${res.references.join(' ')}`, {
                font_face: '微软雅黑'
            });
            page.addLineBreak();
            page.addLineBreak();
            page.addText(res.content, {
                font_face: '微软雅黑'
            });
            page.addLineBreak();
            docx.putPageBreak();
        });

        const out = Fs.createWriteStream(save_path);
        docx.generate(out);
    }
}

/**
 *
 * @param catalogues
 * @param save_path
 * @returns {Array}
 * [
    [
        "D:\back\mine\bible\资料\wdbible/笔记/微读圣经笔记.docx",
        [{
            "title": "那鸿书结构-Jesn",
            "content": "主旨:审判尼尼微（亚述）\n\n背景:\n1. 时间：约拿传道，尼尼微悔改150年后；\n2. 悔改几十年后掳走了加利利，约旦河东居民，以色列北国；\n3. 西希家期间进攻南国，天使解围，神审判，被巴比伦所灭；\n4. 尼尼微是亚述的首都，为宁禄所建。\n\n主要内容\n 鸿1 神审判原则；毁灭尼尼微，拯救犹太人\n 鸿2 尼尼微被毁的细节\n 鸿3 尼尼微的恶，无论如何抵抗终为徒劳。",
            "createTime": 1614557133000,
            "updateTime": 1614741114000,
            "references": ["那鸿书 1:1"]
        }]
    ]
 ]
 */
cls.prototype.getResourceList = async function (catalogues,save_path,cookies,is_cache) {
    const back = [];
    for(let name of catalogues.values()) {
        const cat = Wdbible.catalogues[name];
        const type_info = Object.assign({name}, cat);
        const result = await circle(type_info,save_path,cookies,is_cache);
        if (type_info && result) back.push(...result);
    }
    return back;

    async function circle (type_info,save,cookies,is_cache) {
        let urls = type_info.url;
        if(!urls) return;
        if(urls.constructor != Array) urls = [urls];

        let name = type_info.name;
        save = save || '';
        if(name) save += `/${name}`;

        let type = type_info.type,
            resources = [];

        switch (type) {
            case Wdbible.types.note_list:
                for(let url of urls.values()) {
                    const infos = await Wdbible[type](url,cookies,is_cache);
                    resources.push([`${save}/微读圣经笔记.docx`,infos]);
                }
                break;
        }

        return resources.filter(x=>x);
    }
};

module.exports = new cls();