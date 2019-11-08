'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Fydt = require('../external/fydt');

class cls {
    constructor () {
        this.catalogues = ["shujuanchakao","zhuantixilie","jiangdaoxinxi","shengjingyishenlun","shengmingzaisi"];
        //todo:通过网页获取
    }
}

cls.prototype.check = async function () {
    let infos = await Fydt.get()
};

module.exports = new cls();