import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './common/guards/auth/auth.guard';
import { RolesGuard } from './common/guards/roles/roles.guard';
import { GlobalGuard } from './common/guards/globalGuard';
// import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {  
  const app = await NestFactory.create(AppModule);
  // app.use(authmiddleware)
  // app.useGlobalPipes(new ValidationPipe({ transform: true, whiteList:  true, forbidnWhiteListed: true }));
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new GlobalGuard(reflector));
  await app.listen(process.env.APPLICATION_PORT ?? 3000);
}
bootstrap();
