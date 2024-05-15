"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const http_status_codes_1 = require("http-status-codes");
const Errors_1 = require("../models/Errors");
const validate = (validation) => {
    return async (req, res, next) => {
        await validation.run(req);
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        const errorObject = errors.mapped();
        const entityError = new Errors_1.EntityError({ errors: {} });
        for (const key in errorObject) {
            const { msg } = errorObject[key];
            if (msg instanceof Errors_1.ErrorWithStatus && msg.status !== http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY) {
                return next(msg);
            }
            entityError.errors[key] = msg;
        }
        next(entityError);
    };
};
exports.validate = validate;
