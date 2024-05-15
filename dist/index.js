"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const database_services_1 = __importDefault(require("./database/database.services"));
const error_middlewares_1 = require("./errors/error.middlewares");
const environment_1 = require("./config/environment");
const cors_1 = __importDefault(require("cors"));
const file = fs_1.default.readFileSync('./swagger-ui.yaml', 'utf8');
const swaggerDocument = yaml_1.default.parse(file);
const app = (0, express_1.default)();
// Enable CORS
const corsOption = {
    origin: 'http://localhost:3000' || process.env.PRODUCTION_FRONTEND_URL,
    credentials: true, // access-control-allow-credentials:true
    allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
    optionSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOption));
const PORT = environment_1.env.PORT;
database_services_1.default.connect();
app.use(express_1.default.json());
// All routes - add your routes here
app.use('/users', user_routes_1.default);
app.use(error_middlewares_1.defaultErrorHandler);
// Swagger
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.listen(PORT, () => {
    console.log(`🚀 SHOWBIZ BOOKING EVENT - Server is running at ${environment_1.env.DB_HOST}:${PORT}        🚀`);
    console.log(`🚀 You can test Swagger, which is running at ${environment_1.env.DB_HOST}:${PORT}/api-docs  🚀`);
});
