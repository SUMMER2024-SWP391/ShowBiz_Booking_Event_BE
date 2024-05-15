"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityError = exports.ErrorWithStatus = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_messages_1 = require("../modules/user/user.messages");
class ErrorWithStatus {
    message;
    status;
    constructor({ message, status }) {
        this.message = message;
        this.status = status;
    }
}
exports.ErrorWithStatus = ErrorWithStatus;
class EntityError extends ErrorWithStatus {
    errors;
    constructor({ message = user_messages_1.USER_MESSAGES.VALIDATION_ERROR, errors }) {
        super({ message, status: http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY });
        this.errors = errors;
    }
}
exports.EntityError = EntityError;
