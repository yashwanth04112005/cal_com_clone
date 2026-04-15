import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.routes.js';
import { eventTypeRouter } from './routes/eventTypes.routes.js';
import { availabilityRouter } from './routes/availability.routes.js';
import { publicRouter } from './routes/public.routes.js';
import { bookingRouter } from './routes/bookings.routes.js';
import { questionRouter } from './routes/questions.routes.js';
import { settingsRouter } from './routes/settings.routes.js';
import { appsRouter } from './routes/apps.routes.js';
import { workflowsRouter } from './routes/workflows.routes.js';
import { insightsRouter } from './routes/insights.routes.js';
import { referRouter } from './routes/refer.routes.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/health', healthRouter);
  app.use('/api/event-types', eventTypeRouter);
  app.use('/api/availability', availabilityRouter);
  app.use('/api/public', publicRouter);
  app.use('/api/bookings', bookingRouter);
  app.use('/api/event-types', questionRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/apps', appsRouter);
  app.use('/api/workflows', workflowsRouter);
  app.use('/api/insights', insightsRouter);
  app.use('/api/refer', referRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
