<script lang="ts">
  import { onMount } from 'svelte';
  import { mediaApi, MediaTypes, MediaTypeLabels, ApplicationScenarios, ApplicationScenarioLabels } from '../lib/api';
  import type { Media, CreateMediaDto } from '../lib/api';

  let mediaList: Media[] = [];
  let loading = false;
  let error: string | null = null;
  let showForm = false;
  let editingMedia: Media | null = null;

  let formData: CreateMediaDto = {
    name: '',
    type: MediaTypes.FIBER_OPTIC,
    maxDistance: 0,
    maxBandwidth: 0,
    costPerKm: 0,
    attenuation: 0,
    latency: 0,
    reliability: 5,
    installationDifficulty: 5,
    maintenanceCost: 0,
    environmentalAdaptability: 5,
    applicationScenarios: [],
    specifications: '',
    advantages: '',
    disadvantages: '',
    isActive: true
  };

  onMount(() => {
    loadMedia();
  });

  async function loadMedia() {
    loading = true;
    error = null;
    
    try {
      mediaList = await mediaApi.getAll();
    } catch (err) {
      error = err instanceof Error ? err.message : '加载介质列表失败';
      console.error('加载介质失败:', err);
    } finally {
      loading = false;
    }
  }

  function openCreateForm() {
    editingMedia = null;
    formData = {
      name: '',
      type: MediaTypes.FIBER_OPTIC,
      maxDistance: 0,
      maxBandwidth: 0,
      costPerKm: 0,
      attenuation: 0,
      latency: 0,
      reliability: 5,
      installationDifficulty: 5,
      maintenanceCost: 0,
      environmentalAdaptability: 5,
      applicationScenarios: [],
      specifications: '',
      advantages: '',
      disadvantages: '',
      isActive: true
    };
    showForm = true;
  }

  function openEditForm(media: Media) {
    editingMedia = media;
    formData = {
      name: media.name,
      type: media.type,
      maxDistance: media.maxDistance,
      maxBandwidth: media.maxBandwidth,
      costPerKm: media.costPerKm,
      attenuation: media.attenuation,
      latency: media.latency,
      reliability: media.reliability,
      installationDifficulty: media.installationDifficulty,
      maintenanceCost: media.maintenanceCost,
      environmentalAdaptability: media.environmentalAdaptability,
      applicationScenarios: [...media.applicationScenarios],
      specifications: media.specifications || '',
      advantages: media.advantages || '',
      disadvantages: media.disadvantages || '',
      isActive: media.isActive
    };
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingMedia = null;
  }

  async function saveMedia() {
    loading = true;
    error = null;

    try {
      if (editingMedia) {
        await mediaApi.update(editingMedia.id, formData);
      } else {
        await mediaApi.create(formData);
      }
      
      await loadMedia();
      closeForm();
    } catch (err) {
      error = err instanceof Error ? err.message : '保存失败';
      console.error('保存介质失败:', err);
    } finally {
      loading = false;
    }
  }

  async function deleteMedia(id: number) {
    if (!confirm('确定要删除这个传输介质吗？')) {
      return;
    }

    loading = true;
    error = null;

    try {
      await mediaApi.delete(id);
      await loadMedia();
    } catch (err) {
      error = err instanceof Error ? err.message : '删除失败';
      console.error('删除介质失败:', err);
    } finally {
      loading = false;
    }
  }

  function toggleScenario(scenario: string) {
    if (formData.applicationScenarios.includes(scenario)) {
      formData.applicationScenarios = formData.applicationScenarios.filter(s => s !== scenario);
    } else {
      formData.applicationScenarios = [...formData.applicationScenarios, scenario];
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

  // 获取评分星级
  function getStarRating(score: number, max: number = 10) {
    const stars = Math.round((score / max) * 5);
    return Array(5).fill(0).map((_, i) => i < stars);
  }

  // 获取进度条颜色
  function getProgressColor(value: number, max: number = 10) {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'var(--success-500)';
    if (percentage >= 60) return 'var(--warning-500)';
    return 'var(--error-500)';
  }
</script>

<div class="media-management">
  <!-- 页面标题 -->
  <div class="page-header">
    <div class="header-content">
      <h2>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
        传输介质管理
      </h2>
      <p>管理和配置各种网络传输介质的技术参数</p>
    </div>
    
    <button class="add-button btn-primary" onclick={openCreateForm}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
      </svg>
      添加介质
    </button>
  </div>

  <!-- 错误提示 -->
  {#if error}
    <div class="error-card">
      <div class="error-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/>
        </svg>
      </div>
      <div class="error-content">
        <h4>操作失败</h4>
        <p>{error}</p>
      </div>
    </div>
  {/if}

  <!-- 加载状态 -->
  {#if loading}
    <div class="loading-container">
      <div class="loading-spinner">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
          <path d="M20 3.5a16.5 16.5 0 1016.5 16.5.75.75 0 011.5 0 18 18 0 11-18-18 .75.75 0 011.5 0z"/>
        </svg>
      </div>
      <p>正在加载介质数据...</p>
    </div>
  {/if}

  <!-- 介质列表 -->
  {#if !loading}
    <div class="media-grid">
      {#each mediaList as media (media.id)}
        <div class="media-card" class:inactive={!media.isActive}>
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="media-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="M8 8h16v16H8V8zm2 2v12h12V10H10z"/>
                <path d="M4 4h24v24H4V4zm2 2v20h20V6H6z"/>
              </svg>
            </div>
            <div class="media-info">
              <h3 class="media-name">{media.name}</h3>
              <span class="media-type">{MediaTypeLabels[media.type]}</span>
            </div>
            <div class="status-badge" class:active={media.isActive}>
              <div class="status-dot"></div>
              <span>{media.isActive ? '启用' : '禁用'}</span>
            </div>
          </div>

          <!-- 关键规格 -->
          <div class="specs-overview">
            <div class="spec-item">
              <div class="spec-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                </svg>
              </div>
              <div class="spec-details">
                <span class="spec-label">距离</span>
                <span class="spec-value">{media.maxDistance} km</span>
              </div>
            </div>
            
            <div class="spec-item">
              <div class="spec-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                </svg>
              </div>
              <div class="spec-details">
                <span class="spec-label">带宽</span>
                <span class="spec-value">{media.maxBandwidth.toLocaleString()} Mbps</span>
              </div>
            </div>
            
            <div class="spec-item">
              <div class="spec-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
                </svg>
              </div>
              <div class="spec-details">
                <span class="spec-label">成本</span>
                <span class="spec-value">{formatCurrency(media.costPerKm)}/km</span>
              </div>
            </div>
          </div>

          <!-- 性能指标 -->
          <div class="performance-section">
            <h4>性能指标</h4>
            <div class="performance-grid">
              <div class="performance-item">
                <span class="performance-label">可靠性</span>
                <div class="star-rating">
                  {#each getStarRating(media.reliability) as filled, i}
                    <svg width="12" height="12" viewBox="0 0 12 12" class="star" class:filled>
                      <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3L6 1z" fill="currentColor"/>
                    </svg>
                  {/each}
                  <span class="rating-value">{media.reliability}/10</span>
                </div>
              </div>
              
              <div class="performance-item">
                <span class="performance-label">安装难度</span>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       style="width: {(media.installationDifficulty / 10) * 100}%; background-color: {getProgressColor(media.installationDifficulty)}">
                  </div>
                  <span class="progress-value">{media.installationDifficulty}/10</span>
                </div>
              </div>
              
              <div class="performance-item">
                <span class="performance-label">环境适应性</span>
                <div class="progress-bar">
                  <div class="progress-fill" 
                       style="width: {(media.environmentalAdaptability / 10) * 100}%; background-color: {getProgressColor(media.environmentalAdaptability)}">
                  </div>
                  <span class="progress-value">{media.environmentalAdaptability}/10</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 应用场景 -->
          <div class="scenarios-section">
            <h4>应用场景</h4>
            <div class="scenario-tags">
              {#each media.applicationScenarios as scenario}
                <span class="scenario-tag">
                  {ApplicationScenarioLabels[scenario]}
                </span>
              {/each}
            </div>
          </div>

          <!-- 描述信息 -->
          {#if media.advantages || media.disadvantages}
            <div class="description-section">
              {#if media.advantages}
                <div class="description-item advantages">
                  <h5>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    优势
                  </h5>
                  <p>{media.advantages}</p>
                </div>
              {/if}
              
              {#if media.disadvantages}
                <div class="description-item disadvantages">
                  <h5>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                    注意事项
                  </h5>
                  <p>{media.disadvantages}</p>
                </div>
              {/if}
            </div>
          {/if}

          <!-- 操作按钮 -->
          <div class="card-actions">
            <button class="action-button edit" onclick={() => openEditForm(media)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L4.707 14.5H1v-3.707L12.146.146zM2 11.293V13h1.707l9-9L11 2.293l-9 9z"/>
              </svg>
              编辑
            </button>
            <button class="action-button delete" onclick={() => deleteMedia(media.id)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/>
              </svg>
              删除
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- 空状态 -->
    {#if mediaList.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
            <path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm-8 16a4 4 0 108 0 4 4 0 00-8 0zm12 0a4 4 0 108 0 4 4 0 00-8 0z"/>
          </svg>
        </div>
        <h3>暂无传输介质数据</h3>
        <p>系统中还没有添加任何传输介质配置</p>
        <button class="empty-action btn-primary" onclick={openCreateForm}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          添加第一个介质
        </button>
      </div>
    {/if}
  {/if}
</div>

{#if showForm}
  <div class="modal-overlay" onclick={closeForm}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>{editingMedia ? '编辑介质' : '添加介质'}</h3>
        <button class="close-btn" onclick={closeForm}>✕</button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); saveMedia(); }}>
        <div class="form-grid">
          <div class="form-group">
            <label for="name">介质名称</label>
            <input
              id="name"
              type="text"
              bind:value={formData.name}
              required
            />
          </div>

          <div class="form-group">
            <label for="type">介质类型</label>
            <select id="type" bind:value={formData.type} required>
              {#each Object.entries(MediaTypeLabels) as [value, label]}
                <option {value}>{label}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="maxDistance">最大距离 (km)</label>
            <input
              id="maxDistance"
              type="number"
              bind:value={formData.maxDistance}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div class="form-group">
            <label for="maxBandwidth">最大带宽 (Mbps)</label>
            <input
              id="maxBandwidth"
              type="number"
              bind:value={formData.maxBandwidth}
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="costPerKm">成本 (元/km)</label>
            <input
              id="costPerKm"
              type="number"
              bind:value={formData.costPerKm}
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="attenuation">信号衰减 (dB/km)</label>
            <input
              id="attenuation"
              type="number"
              bind:value={formData.attenuation}
              min="0"
              step="0.1"
              required
            />
          </div>

          <div class="form-group">
            <label for="latency">延迟 (ms/km)</label>
            <input
              id="latency"
              type="number"
              bind:value={formData.latency}
              min="0"
              step="0.001"
              required
            />
          </div>

          <div class="form-group">
            <label for="reliability">可靠性 (1-10)</label>
            <input
              id="reliability"
              type="number"
              bind:value={formData.reliability}
              min="1"
              max="10"
              step="0.1"
              required
            />
          </div>

          <div class="form-group">
            <label for="installationDifficulty">安装难度 (1-10)</label>
            <input
              id="installationDifficulty"
              type="number"
              bind:value={formData.installationDifficulty}
              min="1"
              max="10"
              step="0.1"
              required
            />
          </div>

          <div class="form-group">
            <label for="maintenanceCost">维护成本 (元/年/km)</label>
            <input
              id="maintenanceCost"
              type="number"
              bind:value={formData.maintenanceCost}
              min="0"
              required
            />
          </div>

          <div class="form-group">
            <label for="environmentalAdaptability">环境适应性 (1-10)</label>
            <input
              id="environmentalAdaptability"
              type="number"
              bind:value={formData.environmentalAdaptability}
              min="1"
              max="10"
              step="0.1"
              required
            />
          </div>

          <div class="form-group">
            <label>
              <input
                type="checkbox"
                bind:checked={formData.isActive}
              />
              启用状态
            </label>
          </div>
        </div>

        <div class="form-group scenarios-group">
          <label>应用场景</label>
          <div class="scenario-buttons">
            {#each Object.entries(ApplicationScenarioLabels) as [value, label]}
              <button
                type="button"
                class="scenario-btn {formData.applicationScenarios.includes(value) ? 'active' : ''}"
                onclick={() => toggleScenario(value)}
              >
                {label}
              </button>
            {/each}
          </div>
        </div>

        <div class="form-group">
          <label for="specifications">技术规格</label>
          <textarea
            id="specifications"
            bind:value={formData.specifications}
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="advantages">优势描述</label>
          <textarea
            id="advantages"
            bind:value={formData.advantages}
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="disadvantages">劣势描述</label>
          <textarea
            id="disadvantages"
            bind:value={formData.disadvantages}
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" onclick={closeForm}>
            取消
          </button>
          <button type="submit" class="save-btn" disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .media-management {
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .header h2 {
    margin: 0;
    color: #333;
    font-size: 1.8rem;
  }

  .add-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .error {
    background-color: #fee;
    color: #c33;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #c33;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #666;
    font-size: 1.2rem;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .media-card {
    background: white;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .media-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .media-card.inactive {
    opacity: 0.6;
    border-color: #ccc;
  }

  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .type-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  .card-content {
    padding: 20px;
  }

  .specs {
    margin-bottom: 15px;
  }

  .spec-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .spec-row:last-child {
    border-bottom: none;
  }

  .scenarios {
    margin-bottom: 15px;
  }

  .scenario-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 8px;
  }

  .scenario-tag {
    background: #e8f5e8;
    color: #28a745;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  .description {
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: #666;
  }

  .card-actions {
    padding: 15px 20px;
    background: #f8f9fa;
    display: flex;
    gap: 10px;
  }

  .edit-btn, .delete-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s ease;
  }

  .edit-btn {
    background: #007bff;
    color: white;
  }

  .edit-btn:hover {
    background: #0056b3;
  }

  .delete-btn {
    background: #dc3545;
    color: white;
  }

  .delete-btn:hover {
    background: #c82333;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  .empty-state p {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    width: 90%;
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #e1e5e9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .modal-header h3 {
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .scenarios-group {
    grid-column: 1 / -1;
  }

  .form-group label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #555;
  }

  .form-group input, .form-group select, .form-group textarea {
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .scenario-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .scenario-btn {
    padding: 8px 16px;
    border: 2px solid #e1e5e9;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .scenario-btn:hover {
    border-color: #667eea;
    background-color: #f8f9ff;
  }

  .scenario-btn.active {
    background-color: #667eea;
    color: white;
    border-color: #667eea;
  }

  .form-actions {
    padding: 20px;
    border-top: 1px solid #e1e5e9;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .cancel-btn, .save-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .cancel-btn {
    background: #6c757d;
    color: white;
  }

  .cancel-btn:hover {
    background: #545b62;
  }

  .save-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .save-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
