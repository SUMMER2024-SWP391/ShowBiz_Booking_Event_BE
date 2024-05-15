"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RefreshToken {
    _id;
    token;
    created_at;
    user_id;
    constructor({ _id, token, created_at, user_id }) {
        this._id = _id;
        this.token = token;
        this.created_at = created_at || new Date();
        this.user_id = user_id;
    }
}
exports.default = RefreshToken;
