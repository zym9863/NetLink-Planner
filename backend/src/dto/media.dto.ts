import { IsString, IsEnum, IsNumber, IsArray, IsOptional, IsBoolean, Min, Max, Length } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { MediaType, ApplicationScenario } from '../entities/media.entity';

export class CreateMediaDto {
  @ApiProperty({ description: '介质名称', example: '单模光纤' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '介质类型', enum: MediaType, example: MediaType.FIBER_OPTIC })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ description: '最大传输距离(km)', example: 100 })
  @IsNumber()
  @Min(0)
  maxDistance: number;

  @ApiProperty({ description: '最大带宽(Mbps)', example: 10000 })
  @IsNumber()
  @Min(0)
  maxBandwidth: number;

  @ApiProperty({ description: '成本(元/km)', example: 5000 })
  @IsNumber()
  @Min(0)
  costPerKm: number;

  @ApiProperty({ description: '信号衰减(dB/km)', example: 0.2 })
  @IsNumber()
  @Min(0)
  attenuation: number;

  @ApiProperty({ description: '延迟(ms/km)', example: 0.005 })
  @IsNumber()
  @Min(0)
  latency: number;

  @ApiProperty({ description: '可靠性评分(1-10)', example: 9 })
  @IsNumber()
  @Min(1)
  @Max(10)
  reliability: number;

  @ApiProperty({ description: '安装难度(1-10)', example: 7 })
  @IsNumber()
  @Min(1)
  @Max(10)
  installationDifficulty: number;

  @ApiProperty({ description: '维护成本(元/年/km)', example: 500 })
  @IsNumber()
  @Min(0)
  maintenanceCost: number;

  @ApiProperty({ description: '环境适应性(1-10)', example: 8 })
  @IsNumber()
  @Min(1)
  @Max(10)
  environmentalAdaptability: number;

  @ApiProperty({ 
    description: '应用场景', 
    enum: ApplicationScenario, 
    isArray: true,
    example: [ApplicationScenario.LAN, ApplicationScenario.WAN]
  })
  @IsArray()
  @IsEnum(ApplicationScenario, { each: true })
  applicationScenarios: ApplicationScenario[];

  @ApiProperty({ description: '技术规格描述', required: false })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({ description: '优势描述', required: false })
  @IsOptional()
  @IsString()
  advantages?: string;

  @ApiProperty({ description: '劣势描述', required: false })
  @IsOptional()
  @IsString()
  disadvantages?: string;

  @ApiProperty({ description: '是否启用', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}

export class MediaQueryDto {
  @ApiProperty({ description: '介质类型', enum: MediaType, required: false })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiProperty({ description: '应用场景', enum: ApplicationScenario, required: false })
  @IsOptional()
  @IsEnum(ApplicationScenario)
  scenario?: ApplicationScenario;

  @ApiProperty({ description: '最小带宽(Mbps)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBandwidth?: number;

  @ApiProperty({ description: '最大距离(km)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiProperty({ description: '最大成本(元/km)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCost?: number;

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
