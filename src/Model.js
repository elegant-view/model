/**
 * @file Model
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import Event from './Event';
import {isArray} from './util';

const STORE = Symbol('store');
const SET = Symbol('set');
const GET = Symbol('get');
const SET_OBJECT = Symbol('setObject');
const SET_ARRAY = Symbol('setArray');

export const COMMAND_SET = Symbol('$set');
export const COMMAND_PUSH = Symbol('$push');

export default class Model extends Event {
    constructor(...args) {
        super(...args);
        this[STORE] = {};
    }

    [SET](name, value, target) {
        if (target[name] === value) {
            return false;
        }

        let isChanged = false;
        const valueType = typeof value;
        if (valueType === 'object' && value !== null) {
            if (target[name] !== value) {
                const isArr = isArray(value);
                const nextTarget = isArr ? [] : {};
                target[name] = nextTarget;

                isChanged = isArr ? this[SET_ARRAY](name, value, nextTarget)
                    : this[SET_OBJECT](name, value, nextTarget);
            }
        }
        else {
            isChanged = true;
            target[name] = value;
        }

        return isChanged;
    }

    [SET_ARRAY](name, arr, target) {
        let isChanged = false;
        for (let i = 0, il = arr.length; i < il; ++i) {
            if (this[SET](i, arr[i], target)) {
                isChanged = true;
            }
        }
        return isChanged;
    }

    [SET_OBJECT](name, object, target) {
        let isChanged = false;
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                if (this[SET](key, object[key], target)) {
                    isChanged = true;
                }
            }
        }
        return isChanged;
    }

    [GET](keypath, keyArr) {
        let ret = this[STORE];
        iterateKeypath(keypath, key => {
            ret = ret[key];
            if (keyArr) {
                keyArr.push(key);
            }
            return !ret;
        });
        return ret;
    }

    set(...args) {
        const [keypath, value, {command = COMMAND_SET, isSilent = false}] = args;

        const targets = [this[STORE]];
        const keys = [];
        iterateKeypath(keypath, key => {
            keys.push(key);
            const last = targets[targets.length - 1];
            if (!last) {
                targets.push(undefined);
                return;
            }

            const target = last[key];
            targets.push(target);
        });

        let isChanged = false;
        if (command === COMMAND_SET) {
            const target = targets[targets.length - 2];
            if (target) {
                const lastKey = keys[keys.length - 1];
                isChanged = this[SET](lastKey, value, target);
            }
        }
        else {
            const target = targets[targets.length - 1];
            if (command === COMMAND_PUSH && isArray(target)) {
                isChanged = this[SET](target.length, value, target);
            }
        }

        if (isChanged && isSilent) {
            this.trigger('change', {keys});
        }
    }

    get(name) {
        return this[GET](name);
    }
}

function iterateKeypath(keypath, iteraterFn) {
    let keyStack = [];
    let operatorStack = [];
    for (let i = 0, il = keypath.length; i < il; ++i) {
        let ch = keypath[i];

        if (ch === '.') {
            if (keyStack.length) {
                if (iteraterFn(keyStack.join(''))) {
                    return;
                }
                keyStack = [];
            }
        }
        else if (ch === '[') {
            if (operatorStack[0] !== '[') {
                operatorStack[0] = ch;
            }
            else {
                keyStack.push(ch);
            }
        }
        else if (ch === ']') {
            if (operatorStack[0] === '[') {
                if (iteraterFn(keyStack.join(''))) {
                    return;
                }
                keyStack = [];
            }
            else {
                keyStack.push(ch);
            }
        }
    }
}
