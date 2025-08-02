import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MediaController } from './controllers/media.controller';
import { RecommendationController } from './controllers/recommendation.controller';
import { MediaService } from './services/media.service';
import { RecommendationService } from './services/recommendation.service';
import { Media } from './entities/media.entity';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Media]),
  ],
  controllers: [
    AppController,
    MediaController,
    RecommendationController,
  ],
  providers: [
    AppService,
    MediaService,
    RecommendationService,
  ],
})
export class AppModule {}
