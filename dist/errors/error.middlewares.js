"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorHandler = void 0;
const http_status_codes_1 = require("http-status-codes");
const lodash_1 = require("lodash");
const Errors_1 = require("../models/Errors");
const defaultErrorHandler = (err, req, res, next) => {
    if (err instanceof Errors_1.ErrorWithStatus)
        return res.status(err.status).json((0, lodash_1.omit)(err, ['status']));
    Object.getOwnPropertyNames(err).forEach((key) => {
        Object.defineProperty(err, key, { enumerable: true });
    });
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        errorInfo: (0, lodash_1.omit)(err, ['stack'])
    });
};
exports.defaultErrorHandler = defaultErrorHandler;
