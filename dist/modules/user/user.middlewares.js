"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidator = exports.loginValidator = void 0;
const express_validator_1 = require("express-validator");
const user_messages_1 = require("../../modules/user/user.messages");
const database_services_1 = __importDefault(require("../../database/database.services"));
const user_services_1 = __importDefault(require("../../modules/user/user.services"));
const crypto_1 = require("../../utils/crypto");
const validation_1 = require("../../utils/validation");
const passwordSchema = {
    notEmpty: { errorMessage: user_messages_1.USER_MESSAGES.PASSWORD_IS_REQUIRED },
    isLength: {
        options: { min: 6, max: 50 },
        errorMessage: user_messages_1.USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    isStrongPassword: {
        options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: user_messages_1.USER_MESSAGES.PASSWORD_MUST_BE_STRONG
    }
};
const confirmPasswordSchema = {
    notEmpty: { errorMessage: user_messages_1.USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
    isLength: {
        options: { min: 6, max: 50 },
        errorMessage: user_messages_1.USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
    },
    isStrongPassword: {
        options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: user_messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
    },
    custom: {
        options: (value, { req }) => {
            if (value !== req.body.password)
                throw new Error(user_messages_1.USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD);
            return true;
        }
    }
};
const nameSchema = {
    notEmpty: { errorMessage: user_messages_1.USER_MESSAGES.NAME_IS_REQUIRED },
    isString: { errorMessage: user_messages_1.USER_MESSAGES.NAME_MUST_BE_A_STRING },
    trim: true,
    isLength: {
        options: { min: 1, max: 100 },
        errorMessage: user_messages_1.USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
    }
};
const dateOfBirthSchema = {
    isISO8601: {
        options: {
            strict: true,
            strictSeparator: true
        }
    },
    errorMessage: user_messages_1.USER_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
};
exports.loginValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: { errorMessage: user_messages_1.USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: user_messages_1.USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
            options: async (email, { req }) => {
                const user = await database_services_1.default.users.findOne({
                    email,
                    password: (0, crypto_1.hashPassword)(req.body.password)
                });
                if (!user)
                    throw new Error(user_messages_1.USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT);
                req.user = user;
                return true;
            }
        }
    },
    password: {
        notEmpty: { errorMessage: user_messages_1.USER_MESSAGES.PASSWORD_IS_REQUIRED },
        isLength: {
            options: { min: 6, max: 50 },
            errorMessage: user_messages_1.USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
            options: {
                minLength: 6,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            },
            errorMessage: user_messages_1.USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
    }
}, ['body']));
exports.registerValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: nameSchema,
    email: {
        notEmpty: { errorMessage: user_messages_1.USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: user_messages_1.USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
            options: async (value) => {
                const isExistEmail = await user_services_1.default.checkEmailExist(value);
                if (isExistEmail)
                    throw new Error(user_messages_1.USER_MESSAGES.EMAIL_ALREADY_EXISTED);
                return true;
            }
        }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    date_of_birth: dateOfBirthSchema
}, ['body']));
