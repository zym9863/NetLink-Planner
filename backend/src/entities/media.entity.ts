import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaType {
  FIBER_OPTIC = 'fiber_optic',
  COPPER = 'copper',
  WIRELESS = 'wireless',
  SATELLITE = 'satellite',
  COAXIAL = 'coaxial'
}

export enum ApplicationScenario {
  LAN = 'lan',
  WAN = 'wan',
  DATACENTER = 'datacenter',
  CAMPUS = 'campus',
  METRO = 'metro',
  LONG_HAUL = 'long_haul'
}

@Entity('media')
export class Media {
  @ApiProperty({ description: '介质ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '介质名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '介质类型', enum: MediaType })
  @Column({
    type: 'varchar',
    enum: MediaType
  })
  type: MediaType;

  @ApiProperty({ description: '最大传输距离(km)' })
  @Column('decimal', { precision: 10, scale: 2 })
  maxDistance: number;

  @ApiProperty({ description: '最大带宽(Mbps)' })
  @Column('decimal', { precision: 15, scale: 2 })
  maxBandwidth: number;

  @ApiProperty({ description: '成本(元/km)' })
  @Column('decimal', { precision: 10, scale: 2 })
  costPerKm: number;

  @ApiProperty({ description: '信号衰减(dB/km)' })
  @Column('decimal', { precision: 8, scale: 4 })
  attenuation: number;

  @ApiProperty({ description: '延迟(ms/km)' })
  @Column('decimal', { precision: 8, scale: 4 })
  latency: number;

  @ApiProperty({ description: '可靠性评分(1-10)' })
  @Column('decimal', { precision: 3, scale: 1 })
  reliability: number;

  @ApiProperty({ description: '安装难度(1-10)' })
  @Column('decimal', { precision: 3, scale: 1 })
  installationDifficulty: number;

  @ApiProperty({ description: '维护成本(元/年/km)' })
  @Column('decimal', { precision: 10, scale: 2 })
  maintenanceCost: number;

  @ApiProperty({ description: '环境适应性(1-10)' })
  @Column('decimal', { precision: 3, scale: 1 })
  environmentalAdaptability: number;

  @ApiProperty({ description: '应用场景', enum: ApplicationScenario, isArray: true })
  @Column('simple-array')
  applicationScenarios: ApplicationScenario[];

  @ApiProperty({ description: '技术规格描述' })
  @Column('text', { nullable: true })
  specifications: string;

  @ApiProperty({ description: '优势描述' })
  @Column('text', { nullable: true })
  advantages: string;

  @ApiProperty({ description: '劣势描述' })
  @Column('text', { nullable: true })
  disadvantages: string;

  @ApiProperty({ description: '是否启用' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
