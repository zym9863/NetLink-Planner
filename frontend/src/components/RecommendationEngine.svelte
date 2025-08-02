<script lang="ts">
  import { recommendationApi, ApplicationScenarios, ApplicationScenarioLabels, Priorities, PriorityLabels, MediaTypeLabels } from '../lib/api';
  import type { RecommendationRequest, RecommendationResponse } from '../lib/api';

  let formData: RecommendationRequest = {
    distance: 10,
    requiredBandwidth: 1000,
    budgetLimit: 10000,
    scenario: ApplicationScenarios.WAN,
    priorities: [Priorities.COST, Priorities.PERFORMANCE],
    reliabilityRequirement: 8,
    latencyRequirement: 10,
    environmentalConditions: 7,
    installationDifficultyLimit: 8
  };

  let loading = false;
  let result: RecommendationResponse | null = null;
  let error: string | null = null;

  async function getRecommendations() {
    loading = true;
    error = null;
    
    try {
      result = await recommendationApi.getRecommendations(formData);
    } catch (err) {
      error = err instanceof Error ? err.message : '获取推荐失败';
      console.error('推荐请求失败:', err);
    } finally {
      loading = false;
    }
  }

  function togglePriority(priority: string) {
    if (formData.priorities.includes(priority)) {
      formData.priorities = formData.priorities.filter(p => p !== priority);
    } else {
      formData.priorities = [...formData.priorities, priority];
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // 星级评分组件
  function getStarRating(score: number, max: number = 10) {
    const percentage = (score / max) * 100;
    return {
      full: Math.floor(percentage / 20),
      partial: (percentage % 20) / 20,
      empty: 5 - Math.ceil(percentage / 20)
    };
  }

  // 进度条组件
  function getProgressColor(value: number, max: number = 10) {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'var(--success-500)';
    if (percentage >= 60) return 'var(--warning-500)';
    return 'var(--error-500)';
  }
</script>

<div class="recommendation-engine">
  <!-- 页面标题 -->
  <div class="page-header">
    <div class="header-content">
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        智能推荐引擎
      </h2>
      <p>基于您的需求智能匹配最佳网络传输方案</p>
    </div>
  </div>
  
  <!-- 表单容器 -->
  <div class="form-wrapper">
    <form class="recommendation-form" on:submit={(e) => { e.preventDefault(); getRecommendations(); }}>
      <!-- 基础参数 -->
      <div class="form-section">
        <h3>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 7H7v6h6V7z"/>
            <path d="M19 19H5V5h14v14zM3 3v16h16V3H3z"/>
          </svg>
          基础参数
        </h3>
        <div class="form-grid">
          <div class="input-group">
            <label for="distance" class="input-label">
              传输距离 (km)
              <span class="label-hint">网络连接的物理距离</span>
            </label>
            <div class="input-wrapper">
              <input 
                id="distance"
                type="number" 
                bind:value={formData.distance} 
                min="0.1" 
                step="0.1"
                required 
                class="form-input"
                placeholder="输入距离"
              />
              <span class="input-unit">km</span>
            </div>
          </div>

          <div class="input-group">
            <label for="bandwidth" class="input-label">
              所需带宽 (Mbps)
              <span class="label-hint">预期的数据传输速率</span>
            </label>
            <div class="input-wrapper">
              <input 
                id="bandwidth"
                type="number" 
                bind:value={formData.requiredBandwidth} 
                min="1"
                required 
                class="form-input"
                placeholder="输入带宽"
              />
              <span class="input-unit">Mbps</span>
            </div>
          </div>

          <div class="input-group">
            <label for="budget" class="input-label">
              预算上限 (元/km)
              <span class="label-hint">每公里建设成本预算</span>
            </label>
            <div class="input-wrapper">
              <input 
                id="budget"
                type="number" 
                bind:value={formData.budgetLimit} 
                min="100"
                required 
                class="form-input"
                placeholder="输入预算"
              />
              <span class="input-unit">元/km</span>
            </div>
          </div>

          <div class="input-group">
            <label for="scenario" class="input-label">
              应用场景
              <span class="label-hint">选择网络使用场景</span>
            </label>
            <select id="scenario" bind:value={formData.scenario} required class="form-select">
              {#each Object.entries(ApplicationScenarioLabels) as [value, label]}
                <option {value}>{label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- 性能要求 -->
      <div class="form-section">
        <h3>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
          </svg>
          性能要求
        </h3>
        <div class="form-grid">
          <div class="input-group">
            <label for="reliability" class="input-label">
              可靠性要求
              <span class="label-hint">系统稳定性要求 (1-10)</span>
            </label>
            <div class="slider-wrapper">
              <input 
                id="reliability"
                type="range" 
                bind:value={formData.reliabilityRequirement} 
                min="1" 
                max="10"
                step="0.1"
                class="range-slider"
              />
              <div class="slider-value">{formData.reliabilityRequirement.toFixed(1)}/10</div>
              <div class="slider-track" style="--value: {formData.reliabilityRequirement * 10}%"></div>
            </div>
          </div>

          <div class="input-group">
            <label for="latency" class="input-label">
              延迟要求 (ms)
              <span class="label-hint">数据传输最大延迟</span>
            </label>
            <div class="input-wrapper">
              <input 
                id="latency"
                type="number" 
                bind:value={formData.latencyRequirement} 
                min="0"
                step="0.1"
                class="form-input"
                placeholder="输入延迟要求"
              />
              <span class="input-unit">ms</span>
            </div>
          </div>

          <div class="input-group">
            <label for="environment" class="input-label">
              环境条件
              <span class="label-hint">安装环境复杂度 (1-10)</span>
            </label>
            <div class="slider-wrapper">
              <input 
                id="environment"
                type="range" 
                bind:value={formData.environmentalConditions} 
                min="1" 
                max="10"
                step="0.1"
                class="range-slider"
              />
              <div class="slider-value">{formData.environmentalConditions.toFixed(1)}/10</div>
            </div>
          </div>

          <div class="input-group">
            <label for="installation" class="input-label">
              安装难度限制
              <span class="label-hint">可接受的安装复杂度 (1-10)</span>
            </label>
            <div class="slider-wrapper">
              <input 
                id="installation"
                type="range" 
                bind:value={formData.installationDifficultyLimit} 
                min="1" 
                max="10"
                step="0.1"
                class="range-slider"
              />
              <div class="slider-value">{formData.installationDifficultyLimit.toFixed(1)}/10</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 优先级选择 -->
      <div class="form-section">
        <h3>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          优先级选择
        </h3>
        <div class="priority-grid">
          {#each Object.entries(PriorityLabels) as [value, label]}
            <button
              type="button"
              class="priority-card"
              class:active={formData.priorities.includes(value)}
              on:click={() => togglePriority(value)}
            >
              <div class="priority-icon">
                {#if value === 'COST'}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                {:else if value === 'PERFORMANCE'}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                {:else if value === 'RELIABILITY'}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V14.5C14.8,15.9 13.4,16.5 12,16.5C10.6,16.5 9.2,15.9 9.2,14.5V10C9.2,8.6 10.6,7 12,7Z"/>
                  </svg>
                {:else}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                {/if}
              </div>
              <span class="priority-label">{label}</span>
              <div class="priority-check">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <button 
          type="submit" 
          class="submit-button btn-primary" 
          disabled={loading || formData.priorities.length === 0}
        >
          {#if loading}
            <svg class="loading-spinner" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 3.5a6.5 6.5 0 106.5 6.5.75.75 0 011.5 0 8 8 0 11-8-8 .75.75 0 011.5 0z"/>
            </svg>
            分析中...
          {:else}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            获取推荐方案
          {/if}
        </button>
        {#if formData.priorities.length === 0}
          <p class="form-hint">请至少选择一个优先级</p>
        {/if}
      </div>
    </form>
  </div>

  <!-- 错误提示 -->
  {#if error}
    <div class="error-card">
      <div class="error-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <div class="error-content">
        <h4>推荐失败</h4>
        <p>{error}</p>
      </div>
    </div>
  {/if}

  <!-- 推荐结果 -->
  {#if result}
    <div class="results-section">
      <div class="results-header">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          推荐结果
        </h3>
        <div class="results-count">{result.recommendations.length} 个方案</div>
      </div>
      
      <!-- 分析摘要 -->
      <div class="summary-card">
        <div class="summary-header">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h4>分析摘要</h4>
        </div>
        <p class="summary-text">{result.summary}</p>
      </div>

      <!-- 推荐方案列表 -->
      {#if result.recommendations.length > 0}
        <div class="recommendations-grid">
          {#each result.recommendations as rec, index}
            <div class="recommendation-card" style="--rank: {index + 1}">
              <!-- 卡片头部 -->
              <div class="card-header">
                <div class="rank-badge">#{index + 1}</div>
                <div class="media-info">
                  <h4 class="media-name">{rec.media.name}</h4>
                  <span class="media-type">{MediaTypeLabels[rec.media.type as keyof typeof MediaTypeLabels]}</span>
                </div>
                <div class="match-score">
                  <div class="score-circle" style="--percentage: {rec.matchScore}%">
                    <span class="score-value">{rec.matchScore}%</span>
                  </div>
                  <span class="score-label">匹配度</span>
                </div>
              </div>

              <!-- 成本信息 -->
              <div class="cost-section">
                <div class="cost-item primary">
                  <div class="cost-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"/>
                    </svg>
                  </div>
                  <div class="cost-details">
                    <span class="cost-label">总投资</span>
                    <span class="cost-value">{formatCurrency(rec.totalCost)}</span>
                  </div>
                </div>
                <div class="cost-item secondary">
                  <div class="cost-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                    </svg>
                  </div>
                  <div class="cost-details">
                    <span class="cost-label">年维护</span>
                    <span class="cost-value">{formatCurrency(rec.annualMaintenanceCost)}</span>
                  </div>
                </div>
              </div>

              <!-- 推荐理由 -->
              <div class="reason-section">
                <div class="reason-header">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                  </svg>
                  <span>推荐理由</span>
                </div>
                <p class="reason-text">{rec.reason}</p>
              </div>

              <!-- 优势和注意事项 -->
              {#if rec.advantages.length > 0 || rec.considerations.length > 0}
                <div class="pros-cons-section">
                  {#if rec.advantages.length > 0}
                    <div class="advantages">
                      <h5>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                        优势
                      </h5>
                      <ul>
                        {#each rec.advantages as advantage}
                          <li>{advantage}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if rec.considerations.length > 0}
                    <div class="considerations">
                      <h5>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                        注意事项
                      </h5>
                      <ul>
                        {#each rec.considerations as consideration}
                          <li>{consideration}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
              {/if}

              <!-- 技术规格 -->
              <div class="specs-section">
                <h5>技术规格</h5>
                <div class="specs-grid">
                  <div class="spec-item">
                    <span class="spec-label">最大带宽</span>
                    <span class="spec-value">{rec.media.maxBandwidth.toLocaleString()} Mbps</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">最大距离</span>
                    <span class="spec-value">{rec.media.maxDistance} km</span>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">可靠性</span>
                    <div class="spec-rating">
                      {#each Array(5) as _, i}
                        <svg width="12" height="12" viewBox="0 0 12 12" class="star" class:filled={i < Math.round(rec.media.reliability / 2)}>
                          <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor"/>
                        </svg>
                      {/each}
                      <span class="rating-value">{rec.media.reliability}/10</span>
                    </div>
                  </div>
                  <div class="spec-item">
                    <span class="spec-label">安装难度</span>
                    <div class="difficulty-bar">
                      <div class="difficulty-fill" style="width: {(rec.media.installationDifficulty / 10) * 100}%; background-color: {getProgressColor(rec.media.installationDifficulty)}"></div>
                      <span class="difficulty-value">{rec.media.installationDifficulty}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-results-card">
          <div class="no-results-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
              <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-2 30l-10-10 2.83-2.83L22 28.34l15.17-15.17L40 16 22 34z"/>
            </svg>
          </div>
          <h4>未找到匹配方案</h4>
          <p>抱歉，没有找到符合您需求的推荐方案。</p>
          <p>建议调整预算或降低性能要求后重新尝试。</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .recommendation-engine {
    max-width: 100%;
    margin: 0 auto;
  }

  /* 页面标题 */
  .page-header {
    margin-bottom: var(--space-xl);
  }

  .header-content {
    text-align: center;
  }

  .header-content h2 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    margin: 0 0 var(--space-sm) 0;
    color: var(--gray-900);
    font-size: 2rem;
    font-weight: 700;
  }

  .header-content p {
    color: var(--gray-600);
    font-size: 1.125rem;
    margin: 0;
  }

  /* 表单样式 */
  .form-wrapper {
    background: white;
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    margin-bottom: var(--space-xl);
  }

  .recommendation-form {
    padding: var(--space-2xl);
  }

  .form-section {
    margin-bottom: var(--space-2xl);
  }

  .form-section:last-child {
    margin-bottom: 0;
  }

  .form-section h3 {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin: 0 0 var(--space-lg) 0;
    color: var(--gray-800);
    font-size: 1.25rem;
    font-weight: 600;
    padding-bottom: var(--space-md);
    border-bottom: 2px solid var(--gray-100);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg);
  }

  .input-group {
    display: flex;
    flex-direction: column;
  }

  .input-label {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: var(--space-sm);
  }

  .label-hint {
    font-weight: 400;
    font-size: 0.875rem;
    color: var(--gray-500);
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .form-input, .form-select {
    width: 100%;
    padding: var(--space-md) var(--space-lg);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    font-size: 1rem;
    font-family: inherit;
    background-color: white;
    color: var(--gray-900);
    transition: var(--transition-colors);
  }

  .form-input:focus, .form-select:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px var(--primary-100);
  }

  .input-unit {
    position: absolute;
    right: var(--space-lg);
    color: var(--gray-500);
    font-size: 0.875rem;
    font-weight: 500;
    pointer-events: none;
  }

  .form-input:has(+ .input-unit) {
    padding-right: 3rem;
  }

  /* 滑块样式 */
  .slider-wrapper {
    position: relative;
    padding: var(--space-md) 0;
  }

  .range-slider {
    width: 100%;
    height: 8px;
    border-radius: var(--radius-md);
    background: var(--gray-200);
    outline: none;
    appearance: none;
    cursor: pointer;
  }

  .range-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--gradient-primary);
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: var(--transition-base);
  }

  .range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .range-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--gradient-primary);
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-md);
  }

  .slider-value {
    position: absolute;
    top: -8px;
    right: 0;
    background: var(--primary-500);
    color: white;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* 优先级选择 */
  .priority-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
  }

  .priority-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-xl);
    background: white;
    cursor: pointer;
    transition: var(--transition-base);
    position: relative;
    overflow: hidden;
  }

  .priority-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: var(--transition-base);
  }

  .priority-card:hover {
    border-color: var(--primary-300);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .priority-card:hover::before {
    opacity: 0.05;
  }

  .priority-card.active {
    border-color: var(--primary-500);
    background: var(--primary-50);
  }

  .priority-card.active::before {
    opacity: 0.1;
  }

  .priority-icon {
    position: relative;
    z-index: 1;
    color: var(--primary-600);
  }

  .priority-label {
    position: relative;
    z-index: 1;
    font-weight: 600;
    color: var(--gray-700);
    text-align: center;
  }

  .priority-check {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    width: 24px;
    height: 24px;
    background: var(--success-500);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0);
    transition: var(--transition-base);
  }

  .priority-card.active .priority-check {
    opacity: 1;
    transform: scale(1);
  }

  /* 表单操作 */
  .form-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    margin-top: var(--space-2xl);
    padding-top: var(--space-xl);
    border-top: 1px solid var(--gray-200);
  }

  .submit-button {
    padding: var(--space-lg) var(--space-2xl);
    font-size: 1.125rem;
    font-weight: 600;
    border-radius: var(--radius-xl);
    min-width: 200px;
    position: relative;
    overflow: hidden;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .form-hint {
    color: var(--warning-600);
    font-size: 0.875rem;
    text-align: center;
    margin: 0;
  }

  /* 错误卡片 */
  .error-card {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    background: var(--error-50);
    border: 1px solid var(--error-200);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .error-icon {
    color: var(--error-500);
    flex-shrink: 0;
  }

  .error-content h4 {
    margin: 0 0 var(--space-xs) 0;
    color: var(--error-700);
    font-size: 1.125rem;
  }

  .error-content p {
    margin: 0;
    color: var(--error-600);
  }

  /* 结果区域 */
  .results-section {
    background: white;
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xl);
    background: var(--gradient-primary);
    color: white;
  }

  .results-header h3 {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .results-count {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    font-weight: 600;
  }

  /* 摘要卡片 */
  .summary-card {
    margin: var(--space-xl);
    padding: var(--space-xl);
    background: var(--primary-50);
    border: 1px solid var(--primary-200);
    border-radius: var(--radius-xl);
  }

  .summary-header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .summary-header h4 {
    margin: 0;
    color: var(--primary-700);
    font-size: 1.125rem;
  }

  .summary-header svg {
    color: var(--primary-600);
  }

  .summary-text {
    margin: 0;
    color: var(--primary-800);
    line-height: 1.6;
  }

  /* 推荐卡片网格 */
  .recommendations-grid {
    display: grid;
    gap: var(--space-xl);
    padding: var(--space-xl);
  }

  .recommendation-card {
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-2xl);
    overflow: hidden;
    transition: var(--transition-base);
    position: relative;
  }

  .recommendation-card:hover {
    border-color: var(--primary-300);
    transform: translateY(-4px);
    box-shadow: var(--shadow-2xl);
  }

  /* 卡片头部 */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-xl);
    background: var(--gradient-primary);
    color: white;
  }

  .rank-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    font-weight: 700;
    font-size: 1.125rem;
  }

  .media-info {
    flex: 1;
    margin: 0 var(--space-lg);
  }

  .media-name {
    margin: 0 0 var(--space-xs) 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .media-type {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .match-score {
    text-align: center;
  }

  .score-circle {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: conic-gradient(
      white var(--percentage),
      rgba(255, 255, 255, 0.3) var(--percentage)
    );
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-xs);
  }

  .score-circle::before {
    content: '';
    position: absolute;
    width: 48px;
    height: 48px;
    background: var(--primary-600);
    border-radius: 50%;
  }

  .score-value {
    position: relative;
    z-index: 1;
    font-weight: 700;
    font-size: 0.875rem;
  }

  .score-label {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  /* 成本区域 */
  .cost-section {
    display: flex;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background: var(--gray-50);
    border-bottom: 1px solid var(--gray-200);
  }

  .cost-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .cost-icon {
    width: 40px;
    height: 40px;
    background: var(--primary-100);
    color: var(--primary-600);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cost-details {
    display: flex;
    flex-direction: column;
  }

  .cost-label {
    font-size: 0.875rem;
    color: var(--gray-600);
    font-weight: 500;
  }

  .cost-value {
    font-weight: 700;
    color: var(--gray-900);
    font-size: 1.125rem;
  }

  /* 推荐理由 */
  .reason-section {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--gray-200);
  }

  .reason-header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
    color: var(--success-600);
    font-weight: 600;
  }

  .reason-text {
    margin: 0;
    color: var(--gray-700);
    line-height: 1.6;
    background: var(--success-50);
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    border-left: 4px solid var(--success-500);
  }

  /* 优势和注意事项 */
  .pros-cons-section {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--gray-200);
  }

  .advantages, .considerations {
    margin-bottom: var(--space-lg);
  }

  .advantages:last-child, .considerations:last-child {
    margin-bottom: 0;
  }

  .advantages h5, .considerations h5 {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin: 0 0 var(--space-md) 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .advantages h5 {
    color: var(--success-600);
  }

  .considerations h5 {
    color: var(--warning-600);
  }

  .advantages ul, .considerations ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .advantages li, .considerations li {
    padding: var(--space-sm) 0;
    color: var(--gray-700);
    position: relative;
    padding-left: var(--space-lg);
  }

  .advantages li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--success-500);
    font-weight: bold;
  }

  .considerations li::before {
    content: '!';
    position: absolute;
    left: 0;
    color: var(--warning-500);
    font-weight: bold;
  }

  /* 技术规格 */
  .specs-section {
    padding: var(--space-lg);
  }

  .specs-section h5 {
    margin: 0 0 var(--space-lg) 0;
    color: var(--gray-800);
    font-size: 1rem;
    font-weight: 600;
  }

  .specs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
  }

  .spec-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
  }

  .spec-label {
    font-weight: 500;
    color: var(--gray-600);
  }

  .spec-value {
    font-weight: 600;
    color: var(--gray-900);
  }

  .spec-rating {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .star {
    color: var(--gray-300);
  }

  .star.filled {
    color: var(--warning-500);
  }

  .rating-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-700);
    margin-left: var(--space-xs);
  }

  .difficulty-bar {
    position: relative;
    width: 80px;
    height: 8px;
    background: var(--gray-200);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .difficulty-fill {
    height: 100%;
    border-radius: var(--radius-md);
    transition: var(--transition-base);
  }

  .difficulty-value {
    position: absolute;
    top: -24px;
    right: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--gray-700);
  }

  /* 无结果状态 */
  .no-results-card {
    text-align: center;
    padding: var(--space-2xl);
    color: var(--gray-600);
  }

  .no-results-icon {
    color: var(--gray-400);
    margin-bottom: var(--space-lg);
  }

  .no-results-card h4 {
    margin: 0 0 var(--space-md) 0;
    color: var(--gray-700);
    font-size: 1.25rem;
  }

  .no-results-card p {
    margin: var(--space-sm) 0;
    line-height: 1.6;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .recommendation-form {
      padding: var(--space-lg);
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .priority-grid {
      grid-template-columns: 1fr;
    }

    .cost-section {
      flex-direction: column;
    }

    .specs-grid {
      grid-template-columns: 1fr;
    }

    .card-header {
      flex-direction: column;
      text-align: center;
      gap: var(--space-md);
    }

    .media-info {
      margin: 0;
    }

    .results-header {
      flex-direction: column;
      gap: var(--space-md);
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .recommendation-engine {
      padding: var(--space-md);
    }

    .form-wrapper,
    .results-section {
      border-radius: var(--radius-xl);
    }

    .recommendation-form {
      padding: var(--space-md);
    }

    .results-header,
    .summary-card,
    .recommendations-grid {
      padding: var(--space-md);
    }
  }
</style>
