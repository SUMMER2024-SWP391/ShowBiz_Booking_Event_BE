"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../../modules/user/user.controllers");
const user_middlewares_1 = require("../../modules/user/user.middlewares");
const handler_1 = require("../../utils/handler");
const usersRouter = (0, express_1.Router)();
usersRouter.get('/', (req, res) => {
    res.json({ message: 'helloooooo cc' });
});
/**
 * * Description: Login by directly register account
 * Path: /login
 * Method: POST
 * Request: { email: string, password: string }
 */
usersRouter.post('/login', user_middlewares_1.loginValidator, (0, handler_1.wrapAsync)(user_controllers_1.loginController));
/**
 * * Description: Register a new user
 * Path: /register
 * Method: POST
 * Request: { name: string, email: string, password: string, confirm_password: string, date_of_birth: string }
 */
usersRouter.post('/register', user_middlewares_1.registerValidator, (0, handler_1.wrapAsync)(user_controllers_1.registerController));
exports.default = usersRouter;
