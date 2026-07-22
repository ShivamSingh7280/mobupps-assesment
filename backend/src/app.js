const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const env = require('./config/env');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { sendSuccess } = require('./utils/ApiResponse');
const logger = require('./utils/logger');

const app = express();

// Render (and most PaaS) put the app behind a reverse proxy, so Express
// only sees the proxy's IP on req.ip unless told to trust the
// X-Forwarded-For header. Without this, express-rate-limit either buckets
// every user under one shared IP or throws a ValidationError when it sees
// a forwarded-for header it wasn't told to trust. `1` = trust exactly one
// hop, matching Render's single reverse proxy.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGINS,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

app.get('/health', (req, res) => sendSuccess(res, { data: { status: 'ok' } }));

try {
  const openApiDocument = YAML.load(path.join(__dirname, '../docs/openapi.yaml'));
  app.use('/api-docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(openApiDocument));
} catch (err) {
  logger.error('Failed to load OpenAPI spec, /api-docs will be unavailable', { message: err.message });
}

app.use('/api/v1', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
