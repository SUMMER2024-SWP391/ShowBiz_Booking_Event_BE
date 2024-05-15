"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const environment_1 = require("../config/environment");
const uri = `mongodb+srv://${environment_1.env.DB_USERNAME}:${environment_1.env.DB_PASSWORD}@cluster0.ic4ersm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
class DatabaseService {
    client;
    db;
    constructor() {
        this.client = new mongodb_1.MongoClient(uri);
        this.db = this.client.db(environment_1.env.DB_NAME);
    }
    async connect() {
        try {
            await this.db.command({ ping: 1 });
            console.log('🚀 Pinged your deployment. You successfully connected to MôngCổ-DB           🚀');
        }
        catch (error) {
            console.log('🚀 ~ DatabaseService ~ connect ~ error:', error);
            throw error;
        }
    }
    get users() {
        return this.db.collection(environment_1.env.DB_COLLECTION_USERS);
    }
    get refresh_tokens() {
        return this.db.collection(environment_1.env.DB_COLLECTION_REFRESH_TOKENS);
    }
}
const databaseService = new DatabaseService();
exports.default = databaseService;
