import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Media } from '../entities/media.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: 'netlink_planner.db',
  entities: [Media],
  synchronize: true, // 生产环境中应该设置为false
  logging: process.env.NODE_ENV === 'development',
};
