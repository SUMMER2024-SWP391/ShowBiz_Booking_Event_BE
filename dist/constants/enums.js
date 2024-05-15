"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = exports.UserVerifyStatus = void 0;
var UserVerifyStatus;
(function (UserVerifyStatus) {
    UserVerifyStatus[UserVerifyStatus["UNVERIFIED"] = 0] = "UNVERIFIED";
    UserVerifyStatus[UserVerifyStatus["VERIFIED"] = 1] = "VERIFIED";
    UserVerifyStatus[UserVerifyStatus["BANNED"] = 2] = "BANNED";
})(UserVerifyStatus || (exports.UserVerifyStatus = UserVerifyStatus = {}));
var TokenType;
(function (TokenType) {
    TokenType[TokenType["ACCESS_TOKEN"] = 0] = "ACCESS_TOKEN";
    TokenType[TokenType["REFRESH_TOKEN"] = 1] = "REFRESH_TOKEN";
    TokenType[TokenType["FORGOT_PASSWORD_TOKEN"] = 2] = "FORGOT_PASSWORD_TOKEN";
    TokenType[TokenType["EMAIL_VERIFY_TOKEN"] = 3] = "EMAIL_VERIFY_TOKEN";
})(TokenType || (exports.TokenType = TokenType = {}));
