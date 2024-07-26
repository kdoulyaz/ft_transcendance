import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    // const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: [
                process.env.FRONTEND_URL,
                process.env.BACKEND_URL,
                process.env.DOMAIN,
                process.env.PUBLIC_URL
            ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE'],
            credentials: true
        }
    });
    
    const config = new DocumentBuilder()
        .setTitle("Transcendence's API")
        .setDescription('The Transcendence API description')
        .setVersion('1.0')
        .addTag('Transcendence')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector))
    );
    app.useGlobalPipes(new ValidationPipe());

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

    app.enableCors({
        origin: true,
        credentials: true // Enable credentials (cookies, authorization headers) cross-origin
    });
    app.use(cookieParser());
    await app.listen(3080);
}
bootstrap();
