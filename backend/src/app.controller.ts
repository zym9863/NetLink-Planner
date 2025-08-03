import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('系统状态')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '获取欢迎信息' })
  @ApiResponse({ status: 200, description: '返回欢迎信息' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  @ApiResponse({ status: 200, description: '返回系统健康状态' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '网络链路规划师 API',
      version: '1.0.0',
      cors: 'enabled'
    };
  }
}
