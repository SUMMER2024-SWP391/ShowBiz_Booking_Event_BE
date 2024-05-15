"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_schema_1 = __importDefault(require("../../modules/user/user.schema"));
const database_services_1 = __importDefault(require("../../database/database.services"));
const crypto_1 = require("../../utils/crypto");
const jwt_1 = require("../../utils/jwt");
const enums_1 = require("../../constants/enums");
const mongodb_1 = require("mongodb");
const refreshToken_schema_1 = __importDefault(require("../refreshToken/refreshToken.schema"));
const environment_1 = require("../../config/environment");
class UserService {
    signAccessToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: { user_id, type: enums_1.TokenType.ACCESS_TOKEN, verify },
            privateKey: environment_1.env.JWT_SECRET_ACCESS_TOKEN,
            options: { expiresIn: environment_1.env.ACCESS_TOKEN_EXPIRES_IN }
        });
    }
    signRefreshToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: { user_id, type: enums_1.TokenType.REFRESH_TOKEN, verify },
            privateKey: environment_1.env.JWT_SECRET_REFRESH_TOKEN,
            options: { expiresIn: environment_1.env.REFRESH_TOKEN_EXPIRES_IN }
        });
    }
    signAccessAndRefreshToken({ user_id, verify }) {
        return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })]);
    }
    signEmailVerifyToken({ user_id, verify }) {
        return (0, jwt_1.signToken)({
            payload: { user_id, type: enums_1.TokenType.EMAIL_VERIFY_TOKEN, verify },
            privateKey: environment_1.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
            options: { expiresIn: environment_1.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
        });
    }
    async checkEmailExist(email) {
        return Boolean(await database_services_1.default.users.findOne({ email }));
    }
    async register(payload) {
        const user_id = new mongodb_1.ObjectId();
        const email_verify_token = await this.signEmailVerifyToken({
            user_id: user_id.toString(),
            verify: enums_1.UserVerifyStatus.UNVERIFIED
        });
        await database_services_1.default.users.insertOne(new user_schema_1.default({
            ...payload,
            _id: user_id,
            username: `user_${user_id.toString()}`,
            email_verify_token,
            password: (0, crypto_1.hashPassword)(payload.password),
            date_of_birth: new Date(payload.date_of_birth)
        }));
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
            user_id: user_id.toString(),
            verify: enums_1.UserVerifyStatus.UNVERIFIED
        });
        await database_services_1.default.refresh_tokens.insertOne(new refreshToken_schema_1.default({
            user_id: new mongodb_1.ObjectId(user_id),
            token: refresh_token
        }));
        console.log('🚀 ~ UserService ~ register ~ email_verify_token:', email_verify_token);
        return { access_token, refresh_token };
    }
    async login({ user_id, verify }) {
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });
        await database_services_1.default.refresh_tokens.insertOne(new refreshToken_schema_1.default({
            user_id: new mongodb_1.ObjectId(user_id),
            token: refresh_token
        }));
        return { access_token, refresh_token };
    }
}
const userService = new UserService();
exports.default = userService;
