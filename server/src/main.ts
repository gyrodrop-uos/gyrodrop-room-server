import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "@/infrastructure/app.module";
import { AllExceptionFilter } from "@/infrastructure/exception.filter";
import { getEnv } from "./env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger setup
  if (getEnv().NODE_ENV === "development") {
    const config = new DocumentBuilder()
      .setTitle("GyroDrop Room Server API")
      .setDescription("APIs for 'GyroDrop' multiplayer game room system.")
      .setVersion("1.0")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionFilter());

  // CORS setup
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
