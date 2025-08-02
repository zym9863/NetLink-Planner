import { Injectable } from '@nestjs/common';
import { MediaService } from './media.service';
import { 
  RecommendationRequestDto, 
  RecommendationResultDto, 
  RecommendationResponseDto,
  Priority 
} from '../dto/recommendation.dto';
import { Media } from '../entities/media.entity';

@Injectable()
export class RecommendationService {
  constructor(private mediaService: MediaService) {}

  async getRecommendations(request: RecommendationRequestDto): Promise<RecommendationResponseDto> {
    // 1. 获取符合基本条件的介质
    const candidateMedia = await this.mediaService.findByCapabilities(
      request.requiredBandwidth,
      request.distance,
      request.budgetLimit
    );

    // 2. 按场景过滤
    const scenarioFilteredMedia = candidateMedia.filter(media => 
      media.applicationScenarios.includes(request.scenario)
    );

    // 3. 应用额外过滤条件
    const filteredMedia = this.applyAdditionalFilters(scenarioFilteredMedia, request);

    // 4. 计算每个介质的匹配度评分
    const scoredRecommendations = filteredMedia.map(media => 
      this.calculateRecommendationScore(media, request)
    );

    // 5. 排序并取前5个推荐
    const topRecommendations = scoredRecommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    // 6. 生成分析摘要
    const summary = this.generateSummary(request, topRecommendations);

    return {
      recommendations: topRecommendations,
      summary,
      requestParams: request
    };
  }

  private applyAdditionalFilters(media: Media[], request: RecommendationRequestDto): Media[] {
    return media.filter(m => {
      // 可靠性要求
      if (request.reliabilityRequirement && m.reliability < request.reliabilityRequirement) {
        return false;
      }

      // 延迟要求
      if (request.latencyRequirement) {
        const totalLatency = m.latency * request.distance;
        if (totalLatency > request.latencyRequirement) {
          return false;
        }
      }

      // 环境适应性
      if (request.environmentalConditions && m.environmentalAdaptability < request.environmentalConditions) {
        return false;
      }

      // 安装难度限制
      if (request.installationDifficultyLimit && m.installationDifficulty > request.installationDifficultyLimit) {
        return false;
      }

      return true;
    });
  }

  private calculateRecommendationScore(media: Media, request: RecommendationRequestDto): RecommendationResultDto {
    const weights = this.calculatePriorityWeights(request.priorities);
    
    // 基础评分计算
    const costScore = this.calculateCostScore(media.costPerKm, request.budgetLimit);
    const performanceScore = this.calculatePerformanceScore(media, request);
    const reliabilityScore = media.reliability * 10; // 转换为0-100分
    const installationScore = (11 - media.installationDifficulty) * 10; // 难度越低分数越高
    const maintenanceScore = this.calculateMaintenanceScore(media.maintenanceCost, request.budgetLimit);

    // 加权计算总分
    const matchScore = 
      costScore * weights.cost +
      performanceScore * weights.performance +
      reliabilityScore * weights.reliability +
      installationScore * weights.installation +
      maintenanceScore * weights.maintenance;

    // 计算成本
    const totalCost = media.costPerKm * request.distance;
    const annualMaintenanceCost = media.maintenanceCost * request.distance;

    // 生成推荐理由和分析
    const reason = this.generateReason(media, request, matchScore);
    const advantages = this.generateAdvantages(media, request);
    const considerations = this.generateConsiderations(media, request);

    return {
      media,
      matchScore: Math.round(matchScore),
      totalCost,
      annualMaintenanceCost,
      reason,
      advantages,
      considerations
    };
  }

  private calculatePriorityWeights(priorities: Priority[]) {
    const totalPriorities = priorities.length;
    const baseWeight = 1 / totalPriorities;

    return {
      cost: priorities.includes(Priority.COST) ? baseWeight : 0.1,
      performance: priorities.includes(Priority.PERFORMANCE) ? baseWeight : 0.1,
      reliability: priorities.includes(Priority.RELIABILITY) ? baseWeight : 0.1,
      installation: priorities.includes(Priority.EASE_OF_INSTALLATION) ? baseWeight : 0.1,
      maintenance: priorities.includes(Priority.MAINTENANCE) ? baseWeight : 0.1
    };
  }

  private calculateCostScore(costPerKm: number, budgetLimit: number): number {
    if (costPerKm > budgetLimit) return 0;
    return ((budgetLimit - costPerKm) / budgetLimit) * 100;
  }

  private calculatePerformanceScore(media: Media, request: RecommendationRequestDto): number {
    const bandwidthScore = Math.min((media.maxBandwidth / request.requiredBandwidth) * 50, 50);
    const distanceScore = Math.min((media.maxDistance / request.distance) * 30, 30);
    const latencyScore = Math.max(20 - (media.latency * request.distance), 0);
    return bandwidthScore + distanceScore + latencyScore;
  }

  private calculateMaintenanceScore(maintenanceCost: number, budgetLimit: number): number {
    const maxAcceptableMaintenance = budgetLimit * 0.1; // 假设维护成本不超过初始成本的10%
    if (maintenanceCost > maxAcceptableMaintenance) return 0;
    return ((maxAcceptableMaintenance - maintenanceCost) / maxAcceptableMaintenance) * 100;
  }

  private generateReason(media: Media, request: RecommendationRequestDto, score: number): string {
    const reasons: string[] = [];

    if (score >= 80) {
      reasons.push(`${media.name}在您的需求场景下表现优异`);
    } else if (score >= 60) {
      reasons.push(`${media.name}基本满足您的需求`);
    } else {
      reasons.push(`${media.name}在某些方面可能需要权衡`);
    }

    if (media.costPerKm <= request.budgetLimit * 0.7) {
      reasons.push('成本效益突出');
    }

    if (media.maxBandwidth >= request.requiredBandwidth * 2) {
      reasons.push('带宽余量充足');
    }

    if (media.reliability >= 8) {
      reasons.push('可靠性表现优秀');
    }

    return reasons.join('，');
  }

  private generateAdvantages(media: Media, request: RecommendationRequestDto): string[] {
    const advantages: string[] = [];

    if (media.advantages) {
      advantages.push(media.advantages);
    }

    if (media.maxBandwidth >= request.requiredBandwidth * 1.5) {
      advantages.push('带宽性能优越，支持未来扩展');
    }

    if (media.reliability >= 9) {
      advantages.push('极高的可靠性，适合关键业务');
    }

    if (media.installationDifficulty <= 5) {
      advantages.push('安装相对简单，部署周期短');
    }

    if (media.environmentalAdaptability >= 8) {
      advantages.push('环境适应性强，适用范围广');
    }

    return advantages;
  }

  private generateConsiderations(media: Media, request: RecommendationRequestDto): string[] {
    const considerations: string[] = [];

    if (media.disadvantages) {
      considerations.push(media.disadvantages);
    }

    if (media.installationDifficulty >= 8) {
      considerations.push('安装难度较高，需要专业技术人员');
    }

    if (media.maintenanceCost > request.budgetLimit * 0.05) {
      considerations.push('维护成本相对较高，需要考虑长期运营成本');
    }

    const totalLatency = media.latency * request.distance;
    if (totalLatency > 5) {
      considerations.push('在长距离传输时需要注意延迟影响');
    }

    if (media.attenuation > 1) {
      considerations.push('信号衰减较大，可能需要中继设备');
    }

    return considerations;
  }

  private generateSummary(request: RecommendationRequestDto, recommendations: RecommendationResultDto[]): string {
    if (recommendations.length === 0) {
      return '根据您的需求参数，暂未找到完全匹配的传输介质方案。建议调整预算或性能要求后重新查询。';
    }

    const bestRecommendation = recommendations[0];
    const summary = [
      `基于您${request.distance}km的传输距离、${request.requiredBandwidth}Mbps的带宽需求和${request.budgetLimit}元/km的预算，`,
      `我们为您推荐了${recommendations.length}个方案。`,
      `最佳推荐是${bestRecommendation.media.name}，匹配度达到${bestRecommendation.matchScore}%，`,
      `总投资约${Math.round(bestRecommendation.totalCost)}元，年维护成本约${Math.round(bestRecommendation.annualMaintenanceCost)}元。`
    ];

    return summary.join('');
  }
}
