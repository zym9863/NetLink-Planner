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
</script>

<div class="recommendation-engine">
  <h2>🎯 智能推荐引擎</h2>
  
  <div class="form-container">
    <form onsubmit={(e) => { e.preventDefault(); getRecommendations(); }}>
      <div class="form-grid">
        <div class="form-group">
          <label for="distance">传输距离 (km)</label>
          <input 
            id="distance"
            type="number" 
            bind:value={formData.distance} 
            min="0.1" 
            step="0.1"
            required 
          />
        </div>

        <div class="form-group">
          <label for="bandwidth">所需带宽 (Mbps)</label>
          <input 
            id="bandwidth"
            type="number" 
            bind:value={formData.requiredBandwidth} 
            min="1"
            required 
          />
        </div>

        <div class="form-group">
          <label for="budget">预算上限 (元/km)</label>
          <input 
            id="budget"
            type="number" 
            bind:value={formData.budgetLimit} 
            min="100"
            required 
          />
        </div>

        <div class="form-group">
          <label for="scenario">应用场景</label>
          <select id="scenario" bind:value={formData.scenario} required>
            {#each Object.entries(ApplicationScenarioLabels) as [value, label]}
              <option {value}>{label}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="reliability">可靠性要求 (1-10)</label>
          <input 
            id="reliability"
            type="number" 
            bind:value={formData.reliabilityRequirement} 
            min="1" 
            max="10"
            step="0.1"
          />
        </div>

        <div class="form-group">
          <label for="latency">延迟要求 (ms)</label>
          <input 
            id="latency"
            type="number" 
            bind:value={formData.latencyRequirement} 
            min="0"
            step="0.1"
          />
        </div>

        <div class="form-group">
          <label for="environment">环境条件 (1-10)</label>
          <input 
            id="environment"
            type="number" 
            bind:value={formData.environmentalConditions} 
            min="1" 
            max="10"
            step="0.1"
          />
        </div>

        <div class="form-group">
          <label for="installation">安装难度限制 (1-10)</label>
          <input 
            id="installation"
            type="number" 
            bind:value={formData.installationDifficultyLimit} 
            min="1" 
            max="10"
            step="0.1"
          />
        </div>
      </div>

      <div class="form-group priorities">
        <label>优先级选择</label>
        <div class="priority-buttons">
          {#each Object.entries(PriorityLabels) as [value, label]}
            <button
              type="button"
              class="priority-btn {formData.priorities.includes(value) ? 'active' : ''}"
              onclick={() => togglePriority(value)}
            >
              {label}
            </button>
          {/each}
        </div>
      </div>

      <button type="submit" class="submit-btn" disabled={loading || formData.priorities.length === 0}>
        {loading ? '分析中...' : '获取推荐方案'}
      </button>
    </form>
  </div>

  {#if error}
    <div class="error">
      ❌ {error}
    </div>
  {/if}

  {#if result}
    <div class="results">
      <h3>📋 推荐结果</h3>
      
      <div class="summary">
        <h4>分析摘要</h4>
        <p>{result.summary}</p>
      </div>

      {#if result.recommendations.length > 0}
        <div class="recommendations">
          {#each result.recommendations as rec, index}
            <div class="recommendation-card">
              <div class="card-header">
                <h4>
                  <span class="rank">#{index + 1}</span>
                  {rec.media.name}
                  <span class="type-badge">{MediaTypeLabels[rec.media.type as keyof typeof MediaTypeLabels]}</span>
                </h4>
                <div class="match-score">
                  匹配度: <strong>{rec.matchScore}%</strong>
                </div>
              </div>

              <div class="card-content">
                <div class="costs">
                  <div class="cost-item">
                    <span class="label">总投资:</span>
                    <span class="value">{formatCurrency(rec.totalCost)}</span>
                  </div>
                  <div class="cost-item">
                    <span class="label">年维护:</span>
                    <span class="value">{formatCurrency(rec.annualMaintenanceCost)}</span>
                  </div>
                </div>

                <div class="reason">
                  <strong>推荐理由:</strong> {rec.reason}
                </div>

                {#if rec.advantages.length > 0}
                  <div class="advantages">
                    <strong>优势:</strong>
                    <ul>
                      {#each rec.advantages as advantage}
                        <li>✅ {advantage}</li>
                      {/each}
                    </ul>
                  </div>
                {/if}

                {#if rec.considerations.length > 0}
                  <div class="considerations">
                    <strong>注意事项:</strong>
                    <ul>
                      {#each rec.considerations as consideration}
                        <li>⚠️ {consideration}</li>
                      {/each}
                    </ul>
                  </div>
                {/if}

                <div class="specs">
                  <div class="spec-item">
                    <span>最大带宽:</span>
                    <span>{rec.media.maxBandwidth.toLocaleString()} Mbps</span>
                  </div>
                  <div class="spec-item">
                    <span>最大距离:</span>
                    <span>{rec.media.maxDistance} km</span>
                  </div>
                  <div class="spec-item">
                    <span>可靠性:</span>
                    <span>{rec.media.reliability}/10</span>
                  </div>
                  <div class="spec-item">
                    <span>安装难度:</span>
                    <span>{rec.media.installationDifficulty}/10</span>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-results">
          <p>😔 抱歉，没有找到符合您需求的推荐方案。</p>
          <p>建议调整预算或降低性能要求后重新尝试。</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .recommendation-engine {
    padding: 20px;
  }

  h2 {
    color: #333;
    margin-bottom: 20px;
    font-size: 1.8rem;
  }

  .form-container {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group.priorities {
    grid-column: 1 / -1;
  }

  label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #555;
  }

  input, select {
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .priority-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .priority-btn {
    padding: 8px 16px;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .priority-btn:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
  }

  .priority-btn.active {
    background-color: #667eea;
    color: white;
    border-color: #667eea;
  }

  .submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
    margin-top: 20px;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    background-color: #fee;
    color: #c33;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #c33;
  }

  .results {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .summary {
    background: #f8f9ff;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    border-left: 4px solid #667eea;
  }

  .summary h4 {
    margin: 0 0 10px 0;
    color: #667eea;
  }

  .recommendations {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .recommendation-card {
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .recommendation-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-header h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .rank {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  .type-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  .match-score {
    font-size: 1.1rem;
  }

  .card-content {
    padding: 20px;
  }

  .costs {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .cost-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cost-item .label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;
  }

  .cost-item .value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
  }

  .reason {
    margin-bottom: 15px;
    padding: 15px;
    background: #e8f5e8;
    border-radius: 8px;
    border-left: 4px solid #28a745;
  }

  .advantages, .considerations {
    margin-bottom: 15px;
  }

  .advantages ul, .considerations ul {
    margin: 10px 0 0 0;
    padding-left: 0;
    list-style: none;
  }

  .advantages li, .considerations li {
    padding: 5px 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .specs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .spec-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e1e5e9;
  }

  .spec-item:last-child {
    border-bottom: none;
  }

  .no-results {
    text-align: center;
    padding: 40px;
    color: #666;
  }

  .no-results p {
    margin: 10px 0;
    font-size: 1.1rem;
  }
</style>
