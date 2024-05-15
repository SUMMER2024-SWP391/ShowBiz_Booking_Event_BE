"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterMiddleware = void 0;
const lodash_1 = require("lodash");
const filterMiddleware = (filterKey) => (req, res, next) => {
    req.body = (0, lodash_1.pick)(req.body, filterKey);
    next();
};
exports.filterMiddleware = filterMiddleware;
