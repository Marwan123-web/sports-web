import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './common/guards/auth/auth.guard';
import { RolesGuard } from './common/guards/roles/roles.guard';
import { GlobalGuard } from './common/guards/globalGuard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {  
  const app = await NestFactory.create(AppModule);
  // app.use(authmiddleware)
  // app.useGlobalPipes(new ValidationPipe({ transform: true, whiteList:  true, forbidnWhiteListed: true }));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new GlobalGuard(reflector));
  app.enableCors({
    origin: 'http://localhost:3000', // allow your frontend origin
    credentials: true,               // if you need cookies or auth headers
  });
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Tournament API')
    .setDescription('Complete tournament management system')
    .setVersion('1.0')
    .addBearerAuth()  // ✅ JWT support
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.APPLICATION_PORT ?? 3000);
}
bootstrap();
