"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = exports.loginController = void 0;
const user_services_1 = __importDefault(require("../../modules/user/user.services"));
const user_messages_1 = require("../../modules/user/user.messages");
const loginController = async (req, res) => {
    const user = req.user;
    const user_id = user._id;
    const result = await user_services_1.default.login({ user_id: user_id.toString(), verify: user.verify });
    res.json({
        message: user_messages_1.USER_MESSAGES.LOGIN_SUCCESS,
        result
    });
};
exports.loginController = loginController;
const registerController = async (req, res, next) => {
    const result = await user_services_1.default.register(req.body);
    return res.json({
        message: user_messages_1.USER_MESSAGES.REGISTER_SUCCESS,
        result
    });
};
exports.registerController = registerController;
