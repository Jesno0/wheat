'use strict';
/**
 * Created by Jesn on 2020/3/25.
 *
 */

const fs = require('fs');
const path = require('path');

class cls {
    constructor() {}
}

cls.prototype.mkdirs = function(dirpath) {
    if(fs.existsSync(dirpath)) return;
    if (!fs.existsSync(path.dirname(dirpath))) {
        this.mkdirs(path.dirname(dirpath));
    }
    fs.mkdirSync(dirpath);
};

module.exports = new cls();