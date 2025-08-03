import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 启用CORS
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000',
      'https://netlink-planner.pages.dev',
      'https://netlink-planner.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200, // 为旧版浏览器提供支持
  });

  // 配置Swagger文档
  const config = new DocumentBuilder()
    .setTitle('网络链路规划师 API')
    .setDescription('智能化网络传输介质选型系统 API 文档')
    .setVersion('1.0')
    .addTag('传输介质管理', '传输介质信息的增删改查操作')
    .addTag('智能推荐引擎', '基于需求参数的智能推荐服务')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 应用启动成功！`);
  console.log(`📖 API文档地址: http://localhost:${port}/api-docs`);
  console.log(`🌐 服务地址: http://localhost:${port}`);
}
bootstrap();
