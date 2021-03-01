'use strict';
/**
 * Created by Jesn on 2020/4/17.
 *
 */

import Axios from 'axios';

const ApiTaskList = function (id) {
    return request('get',`/task/list?id=${id}`);
};
const ApiTaskRemove = function (id) {
    return request('get',`/task/remove?id=${id}`);
};
const ApiTaskStart = function () {
    return request('get',`/task/start`);
};
const ApiTaskStop = function () {
    return request('get',`/task/stop`);
};

const ApiFydtInit = function () {
    return request('get',`/fydt/init`);
};
const ApiFydtSync = function (opts) {
    return request('post',`/fydt/sync`,opts);
};
const ApiAiShenInit = function () {
    return request('get',`/aishen/init`);
};
const ApiAiShenSync = function (opts) {
    return request('post',`/aishen/sync`,opts);
};
const ApiBornforloveInit = function () {
    return request('get',`/bornforlove/init`);
};
const ApiBornforloveSync = function (opts) {
    return request('post',`/bornforlove/sync`,opts);
};
const ApiStoryInit = function () {
    return request('get',`/story/init`);
};
const ApiStorySync = function (opts) {
    return request('post',`/story/sync`,opts);
};
const ApiFileInit = function () {
    return request('get',`/file/init`);
};
const ApiFileSync = function (opts) {
    return request('post',`/file/sync`,opts);
};
const ApiFileCatalogue = function (opts) {
    return request('post',`/file/catalogue`,opts);
};
const FileBuffer = function (path) {
    return request('request',path,{responseType: 'arraybuffer'});
}

function request (method,url,opts) {
    return Axios[method](url,opts).then(function (result) {
        if((result.status >= 500) && (result.status <= 600)) return Promise.reject('请重新打开程序');
        if(result.status != 200) return Promise.reject(result);
        result = result.data;
        if(result.constructor != Object) return result;
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
    ApiBornforloveInit,
    ApiBornforloveSync,
    ApiStoryInit,
    ApiStorySync,
    ApiFileInit,
    ApiFileSync,
    ApiFileCatalogue,
    FileBuffer
}