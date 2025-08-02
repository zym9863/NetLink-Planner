import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, ApplicationScenario } from '../entities/media.entity';
import { CreateMediaDto, UpdateMediaDto, MediaQueryDto } from '../dto/media.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async create(createMediaDto: CreateMediaDto): Promise<Media> {
    const media = this.mediaRepository.create(createMediaDto);
    return await this.mediaRepository.save(media);
  }

  async findAll(query?: MediaQueryDto): Promise<Media[]> {
    const queryBuilder = this.mediaRepository.createQueryBuilder('media');

    if (query?.type) {
      queryBuilder.andWhere('media.type = :type', { type: query.type });
    }

    if (query?.scenario) {
      queryBuilder.andWhere('media.applicationScenarios LIKE :scenario', { 
        scenario: `%${query.scenario}%` 
      });
    }

    if (query?.minBandwidth) {
      queryBuilder.andWhere('media.maxBandwidth >= :minBandwidth', { 
        minBandwidth: query.minBandwidth 
      });
    }

    if (query?.maxDistance) {
      queryBuilder.andWhere('media.maxDistance >= :maxDistance', { 
        maxDistance: query.maxDistance 
      });
    }

    if (query?.maxCost) {
      queryBuilder.andWhere('media.costPerKm <= :maxCost', { 
        maxCost: query.maxCost 
      });
    }

    if (query?.isActive !== undefined) {
      queryBuilder.andWhere('media.isActive = :isActive', { 
        isActive: query.isActive 
      });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.findOne(id);
    Object.assign(media, updateMediaDto);
    return await this.mediaRepository.save(media);
  }

  async remove(id: number): Promise<void> {
    const media = await this.findOne(id);
    await this.mediaRepository.remove(media);
  }

  async findByScenario(scenario: ApplicationScenario): Promise<Media[]> {
    return await this.mediaRepository
      .createQueryBuilder('media')
      .where('media.applicationScenarios LIKE :scenario', { 
        scenario: `%${scenario}%` 
      })
      .andWhere('media.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findByCapabilities(
    minBandwidth: number, 
    maxDistance: number, 
    maxCost?: number
  ): Promise<Media[]> {
    const queryBuilder = this.mediaRepository
      .createQueryBuilder('media')
      .where('media.maxBandwidth >= :minBandwidth', { minBandwidth })
      .andWhere('media.maxDistance >= :maxDistance', { maxDistance })
      .andWhere('media.isActive = :isActive', { isActive: true });

    if (maxCost) {
      queryBuilder.andWhere('media.costPerKm <= :maxCost', { maxCost });
    }

    return await queryBuilder.getMany();
  }

  async getStatistics() {
    const total = await this.mediaRepository.count();
    const active = await this.mediaRepository.count({ where: { isActive: true } });
    
    const typeStats = await this.mediaRepository
      .createQueryBuilder('media')
      .select('media.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('media.isActive = :isActive', { isActive: true })
      .groupBy('media.type')
      .getRawMany();

    const avgCost = await this.mediaRepository
      .createQueryBuilder('media')
      .select('AVG(media.costPerKm)', 'avgCost')
      .where('media.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      total,
      active,
      typeDistribution: typeStats,
      averageCost: parseFloat(avgCost.avgCost) || 0
    };
  }
}
