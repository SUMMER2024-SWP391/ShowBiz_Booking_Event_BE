export const corsOption = {
  origin: 'http://localhost:3000' || process.env.PRODUCTION_FRONTEND_URL,
  credentials: true, // access-control-allow-credentials:true
  allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
  optionSuccessStatus: 200
}
