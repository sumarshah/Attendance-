import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

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

  // Startup safety log: helps detect "missing data" caused by using a different Docker volume / compose project.
  try {
    const raw = process.env.DATABASE_URL ?? '';
    let host = 'unknown';
    let db = 'unknown';
    try {
      const u = new URL(raw);
      host = u.host || host;
      db = (u.pathname || '').replace(/^\//, '') || db;
    } catch {
      // ignore parse errors
    }

    const prisma = app.get(PrismaService);
    const [users, employees] = await Promise.all([
      prisma.user.count(),
      prisma.employee.count(),
    ]);

    // eslint-disable-next-line no-console
    console.log(`[startup] database=${db} host=${host}`);
    // eslint-disable-next-line no-console
    console.log(`[startup] counts users=${users} employees=${employees}`);

    if (users === 0 && employees === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        '[startup] CRITICAL: Database is empty. Possible wrong Docker volume.',
      );
      // eslint-disable-next-line no-console
      console.warn(
        '[startup] Check COMPOSE_PROJECT_NAME mismatch (recommended: attendance-final) and ensure the Postgres volume is the expected one.',
      );
    }
  } catch {
    // Best-effort only; never block startup.
  }
}
bootstrap();
