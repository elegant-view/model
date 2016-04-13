/**
 * @file ComputedModel
 * @author yibuyisheng(yibuyisheng@163.com)
 */

import Model from './Model';

const REGISTER_COMPUTED = Symbol('registerComputed');
const COMPUTED_VALUES = Symbol('computedValues');

export default class ComputedModel extends Model {
    constructor(...args) {
        super(...args);
        this[COMPUTED_VALUES] = {};
    }

    [REGISTER_COMPUTED](name, deps, computeFn) {
        const computedValues = this[COMPUTED_VALUES];
        if (name in computedValues) {
            return false;
        }

        computedValues[name] = {deps, computeFn};
        this.on('change', event => {
            const {isComputed, keys} = event;
            if (isComputed) {
                return;
            }

            const firstKey = keys[0];
            let contains = false;
            for (let dep of deps) {
                if (dep === firstKey) {
                    contains = true;
                    break;
                }
            }
            if (!contains) {
                return;
            }

            this.trigger('change', {isComputed: true, name});
        });
    }

    getComputed(name) {
        const computed = this[COMPUTED_VALUES][name];
        if (!computed) {
            return;
        }

        const {deps, computeFn} = computed;
        const depValues = [];
        for (let dep of deps) {
            depValues.push(this.get(dep));
        }
        return this::computeFn(...depValues);
    }

    destroy() {
        this[COMPUTED_VALUES] = null;
        super.destroy();
    }
}
