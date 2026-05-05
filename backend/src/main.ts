import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const parseOrigins = (raw?: string) => {
    const parts = (raw ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return parts
  }

  const origins = new Set<string>([
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ])

  for (const o of parseOrigins(process.env.FRONTEND_ORIGINS)) origins.add(o)
  for (const o of parseOrigins(process.env.FRONTEND_ORIGIN)) origins.add(o)

  const port = Number(process.env.PORT ?? 3000);

  app.enableCors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server calls.
      if (!origin) return cb(null, true)
      if (origins.has(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`), false)
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port);
}
bootstrap();
