import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createContext, appRouter } from './trpc';
import { createOpenApiDocument } from 'trpc-openapi';
import { ZodError } from 'zod';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

// Middleware
app.register(helmet);
app.register(cors, {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:19000'],
  credentials: true,
});

// Health check
app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
}));

// tRPC routes
app.post('/trpc/:path(*)', async (req, res) => {
  const { path } = req.params as { path: string };
  const pathSegments = path.split('.');
  
  const caller = appRouter.createCaller(await createContext(req));
  
  try {
    const result = await (caller as any)[pathSegments[0]][pathSegments[1]](req.body);
    res.code(200).send(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.code(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'Validation error',
          issues: error.errors,
        },
      });
    } else {
      console.error('[tRPC Error]', error);
      res.code(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        },
      });
    }
  }
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:3000`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
