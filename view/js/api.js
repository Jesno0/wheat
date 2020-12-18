'use strict';
/**
 * Created by Jesn on 2020/4/17.
 *
 */

import Axios from 'axios';

var ApiTaskList = function (id) {
    return request('get',`/task/list?id=${id}`);
};
var ApiTaskRemove = function (id) {
    return request('get',`/task/remove?id=${id}`);
};
var ApiTaskStart = function () {
    return request('get',`/task/start`);
};
var ApiTaskStop = function () {
    return request('get',`/task/stop`);
};

var ApiFydtInit = function () {
    return request('get',`/fydt/init`);
};
var ApiFydtSync = function (opts) {
    return request('post',`/fydt/sync`,opts);
};
var ApiAiShenInit = function () {
    return request('get',`/aishen/init`);
};
var ApiAiShenSync = function (opts) {
    return request('post',`/aishen/sync`,opts);
};
var ApiStoryInit = function () {
    return request('get',`/story/init`);
};
var ApiStorySync = function (opts) {
    return request('post',`/story/sync`,opts);
};
var ApiFileInit = function () {
    return request('get',`/file/init`);
};
var ApiFileSync = function (opts) {
    return request('post',`/file/sync`,opts);
};
var ApiFileCatalogue = function (opts) {
    return request('post',`/file/catalogue`,opts);
};

function request (method,url,opts) {
    return Axios[method](url,opts).then(function (result) {
        if((result.status >= 500) && (result.status <= 600)) return Promise.reject('请重新打开程序');
        if(result.status != 200) return Promise.reject(result);
        result = result.data;
        if(result.ok != 0) return Promise.reject(result);
        return result.data;
    });
}

export {
    ApiTaskList,
    ApiTaskRemove,
    ApiTaskStart,
    ApiTaskStop,
    ApiFydtInit,
    ApiFydtSync,
    ApiAiShenInit,
    ApiAiShenSync,
    ApiStoryInit,
    ApiStorySync,
    ApiFileInit,
    ApiFileSync,
    ApiFileCatalogue
}