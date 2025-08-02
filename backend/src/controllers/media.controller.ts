import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MediaService } from '../services/media.service';
import { CreateMediaDto, UpdateMediaDto, MediaQueryDto } from '../dto/media.dto';
import { Media } from '../entities/media.entity';

@ApiTags('传输介质管理')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiOperation({ summary: '创建传输介质' })
  @ApiResponse({ status: 201, description: '创建成功', type: Media })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createMediaDto: CreateMediaDto): Promise<Media> {
    return this.mediaService.create(createMediaDto);
  }

  @Get()
  @ApiOperation({ summary: '获取传输介质列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Media] })
  @ApiQuery({ name: 'type', required: false, description: '介质类型' })
  @ApiQuery({ name: 'scenario', required: false, description: '应用场景' })
  @ApiQuery({ name: 'minBandwidth', required: false, description: '最小带宽' })
  @ApiQuery({ name: 'maxDistance', required: false, description: '最大距离' })
  @ApiQuery({ name: 'maxCost', required: false, description: '最大成本' })
  @ApiQuery({ name: 'isActive', required: false, description: '是否启用' })
  async findAll(@Query() query: MediaQueryDto): Promise<Media[]> {
    return this.mediaService.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取介质统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStatistics() {
    return this.mediaService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取传输介质' })
  @ApiResponse({ status: 200, description: '获取成功', type: Media })
  @ApiResponse({ status: 404, description: '介质不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Media> {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新传输介质' })
  @ApiResponse({ status: 200, description: '更新成功', type: Media })
  @ApiResponse({ status: 404, description: '介质不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMediaDto: UpdateMediaDto,
  ): Promise<Media> {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除传输介质' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '介质不存在' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mediaService.remove(id);
  }
}
