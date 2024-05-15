"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = void 0;
const capitalize = (val) => {
    if (!val)
        return '';
    return `${val.charAt(0).toUpperCase()}${val.slice(1)}`;
};
exports.capitalize = capitalize;
//vd: capitalize('hello') => 'Hello'
