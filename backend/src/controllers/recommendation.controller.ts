import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RecommendationService } from '../services/recommendation.service';
import { 
  RecommendationRequestDto, 
  RecommendationResponseDto 
} from '../dto/recommendation.dto';

@ApiTags('智能推荐引擎')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post()
  @ApiOperation({ 
    summary: '获取智能推荐方案',
    description: '根据用户需求参数，智能推荐最适合的网络传输介质方案'
  })
  @ApiResponse({ 
    status: 200, 
    description: '推荐成功', 
    type: RecommendationResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: '请求参数错误' 
  })
  async getRecommendations(
    @Body() request: RecommendationRequestDto
  ): Promise<RecommendationResponseDto> {
    return this.recommendationService.getRecommendations(request);
  }
}
