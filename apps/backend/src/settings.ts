import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'yamljs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT = process.env.PORT || 5100

const swaggerDocs = yaml.load(path.join(__dirname, './swagger.yaml'))

// CORS

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5100',
  'https://localhost:5173'
]

const URL_SCHEME = process.env.NODE_ENV == 'production' ? 'https' : 'http'

// JWT

const JWT_TOKEN_EXPIRATION_TIME = '15m'
const JWT_REFRESH_TOKEN_EXPIRATION_TIME = '7d'
const JWT_HTTP_SECURED = process.env.NODE_ENV == 'production'

// Public routes

const PUBLIC_ROUTES = ['/api/user/sign-in', '/api/user/create', '/api-docs']

export {
  ALLOWED_ORIGINS,
  JWT_HTTP_SECURED,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  JWT_TOKEN_EXPIRATION_TIME,
  PORT,
  PUBLIC_ROUTES,
  swaggerDocs,
  URL_SCHEME
}
