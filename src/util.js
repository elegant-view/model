/**
 * @file 工具方法，继承自Event/util.js
 * @author yibuyisheng(yibuyisheng@163.com)
 */

export * from 'Event/util';
import {getClassName} from 'Event/util';

export function isArray(obj) {
    return getClassName(obj) === 'Array';
}
