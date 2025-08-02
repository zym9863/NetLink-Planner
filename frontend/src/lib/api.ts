import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 传输介质相关接口
export interface Media {
  id: number;
  name: string;
  type: string;
  maxDistance: number;
  maxBandwidth: number;
  costPerKm: number;
  attenuation: number;
  latency: number;
  reliability: number;
  installationDifficulty: number;
  maintenanceCost: number;
  environmentalAdaptability: number;
  applicationScenarios: string[];
  specifications?: string;
  advantages?: string;
  disadvantages?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaDto {
  name: string;
  type: string;
  maxDistance: number;
  maxBandwidth: number;
  costPerKm: number;
  attenuation: number;
  latency: number;
  reliability: number;
  installationDifficulty: number;
  maintenanceCost: number;
  environmentalAdaptability: number;
  applicationScenarios: string[];
  specifications?: string;
  advantages?: string;
  disadvantages?: string;
  isActive?: boolean;
}

export interface MediaQuery {
  type?: string;
  scenario?: string;
  minBandwidth?: number;
  maxDistance?: number;
  maxCost?: number;
  isActive?: boolean;
}

// 推荐相关接口
export interface RecommendationRequest {
  distance: number;
  requiredBandwidth: number;
  budgetLimit: number;
  scenario: string;
  priorities: string[];
  reliabilityRequirement?: number;
  latencyRequirement?: number;
  environmentalConditions?: number;
  installationDifficultyLimit?: number;
}

export interface RecommendationResult {
  media: Media;
  matchScore: number;
  totalCost: number;
  annualMaintenanceCost: number;
  reason: string;
  advantages: string[];
  considerations: string[];
}

export interface RecommendationResponse {
  recommendations: RecommendationResult[];
  summary: string;
  requestParams: RecommendationRequest;
}

// API 方法
export const mediaApi = {
  // 获取所有介质
  getAll: async (query?: MediaQuery): Promise<Media[]> => {
    const response = await api.get('/media', { params: query });
    return response.data;
  },

  // 根据ID获取介质
  getById: async (id: number): Promise<Media> => {
    const response = await api.get(`/media/${id}`);
    return response.data;
  },

  // 创建介质
  create: async (data: CreateMediaDto): Promise<Media> => {
    const response = await api.post('/media', data);
    return response.data;
  },

  // 更新介质
  update: async (id: number, data: Partial<CreateMediaDto>): Promise<Media> => {
    const response = await api.patch(`/media/${id}`, data);
    return response.data;
  },

  // 删除介质
  delete: async (id: number): Promise<void> => {
    await api.delete(`/media/${id}`);
  },

  // 获取统计信息
  getStatistics: async () => {
    const response = await api.get('/media/statistics');
    return response.data;
  },
};

export const recommendationApi = {
  // 获取推荐方案
  getRecommendations: async (request: RecommendationRequest): Promise<RecommendationResponse> => {
    const response = await api.post('/recommendations', request);
    return response.data;
  },
};

// 常量定义
export const MediaTypes = {
  FIBER_OPTIC: 'fiber_optic',
  COPPER: 'copper',
  WIRELESS: 'wireless',
  SATELLITE: 'satellite',
  COAXIAL: 'coaxial'
} as const;

export const ApplicationScenarios = {
  LAN: 'lan',
  WAN: 'wan',
  DATACENTER: 'datacenter',
  CAMPUS: 'campus',
  METRO: 'metro',
  LONG_HAUL: 'long_haul'
} as const;

export const Priorities = {
  COST: 'cost',
  PERFORMANCE: 'performance',
  RELIABILITY: 'reliability',
  EASE_OF_INSTALLATION: 'ease_of_installation',
  MAINTENANCE: 'maintenance'
} as const;

// 中文标签映射
export const MediaTypeLabels = {
  [MediaTypes.FIBER_OPTIC]: '光纤',
  [MediaTypes.COPPER]: '铜缆',
  [MediaTypes.WIRELESS]: '无线',
  [MediaTypes.SATELLITE]: '卫星',
  [MediaTypes.COAXIAL]: '同轴电缆'
};

export const ApplicationScenarioLabels = {
  [ApplicationScenarios.LAN]: '局域网',
  [ApplicationScenarios.WAN]: '广域网',
  [ApplicationScenarios.DATACENTER]: '数据中心',
  [ApplicationScenarios.CAMPUS]: '园区网络',
  [ApplicationScenarios.METRO]: '城域网',
  [ApplicationScenarios.LONG_HAUL]: '长途传输'
};

export const PriorityLabels = {
  [Priorities.COST]: '成本优先',
  [Priorities.PERFORMANCE]: '性能优先',
  [Priorities.RELIABILITY]: '可靠性优先',
  [Priorities.EASE_OF_INSTALLATION]: '易安装性',
  [Priorities.MAINTENANCE]: '维护便利性'
};
