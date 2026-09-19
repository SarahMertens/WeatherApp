import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @ApiResponse({
    status: 200,
    description: 'Server status',
  })
  @Get()
  getHello() {
    return {
      message: 'Weather API is running! 🌤️',
      timestamp: new Date().toISOString(),
    };
  }

  @ApiResponse({
    status: 200,
    description: 'Health check',
  })
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}