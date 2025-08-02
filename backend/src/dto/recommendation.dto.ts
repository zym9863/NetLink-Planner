import { IsNumber, IsEnum, IsOptional, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationScenario } from '../entities/media.entity';

export enum Priority {
  COST = 'cost',
  PERFORMANCE = 'performance',
  RELIABILITY = 'reliability',
  EASE_OF_INSTALLATION = 'ease_of_installation',
  MAINTENANCE = 'maintenance'
}

export class RecommendationRequestDto {
  @ApiProperty({ description: '传输距离(km)', example: 50 })
  @IsNumber()
  @Min(0)
  distance: number;

  @ApiProperty({ description: '所需带宽(Mbps)', example: 1000 })
  @IsNumber()
  @Min(0)
  requiredBandwidth: number;

  @ApiProperty({ description: '预算上限(元/km)', example: 10000 })
  @IsNumber()
  @Min(0)
  budgetLimit: number;

  @ApiProperty({ description: '应用场景', enum: ApplicationScenario, example: ApplicationScenario.WAN })
  @IsEnum(ApplicationScenario)
  scenario: ApplicationScenario;

  @ApiProperty({ 
    description: '优先级权重', 
    enum: Priority, 
    isArray: true,
    example: [Priority.COST, Priority.PERFORMANCE]
  })
  @IsArray()
  @IsEnum(Priority, { each: true })
  priorities: Priority[];

  @ApiProperty({ description: '可靠性要求(1-10)', example: 8, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  reliabilityRequirement?: number;

  @ApiProperty({ description: '延迟要求(ms)', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  latencyRequirement?: number;

  @ApiProperty({ description: '环境条件评分(1-10)', example: 7, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  environmentalConditions?: number;

  @ApiProperty({ description: '安装难度限制(1-10)', example: 8, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  installationDifficultyLimit?: number;
}

export class RecommendationResultDto {
  @ApiProperty({ description: '推荐的介质信息' })
  media: any; // 这里会是Media实体

  @ApiProperty({ description: '匹配度评分(0-100)' })
  matchScore: number;

  @ApiProperty({ description: '总成本估算(元)' })
  totalCost: number;

  @ApiProperty({ description: '年维护成本(元)' })
  annualMaintenanceCost: number;

  @ApiProperty({ description: '推荐理由' })
  reason: string;

  @ApiProperty({ description: '优势分析' })
  advantages: string[];

  @ApiProperty({ description: '注意事项' })
  considerations: string[];
}

export class RecommendationResponseDto {
  @ApiProperty({ description: '推荐结果列表', type: [RecommendationResultDto] })
  recommendations: RecommendationResultDto[];

  @ApiProperty({ description: '分析摘要' })
  summary: string;

  @ApiProperty({ description: '请求参数' })
  requestParams: RecommendationRequestDto;
}
