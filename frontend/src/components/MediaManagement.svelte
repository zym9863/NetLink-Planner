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
    // 表单验证
    if (!formData.name.trim()) {
      error = '请输入介质名称';
      return;
    }
    
    if (!formData.type) {
      error = '请选择介质类型';
      return;
    }
    
    if (formData.maxDistance <= 0) {
      error = '最大距离必须大于0';
      return;
    }
    
    if (formData.maxBandwidth <= 0) {
      error = '最大带宽必须大于0';
      return;
    }
    
    if (formData.costPerKm < 0) {
      error = '成本不能为负数';
      return;
    }
    
    if (formData.attenuation < 0) {
      error = '信号衰减不能为负数';
      return;
    }
    
    if (formData.latency < 0) {
      error = '延迟不能为负数';
      return;
    }
    
    if (formData.maintenanceCost < 0) {
      error = '维护成本不能为负数';
      return;
    }
    
    if (formData.reliability < 1 || formData.reliability > 10) {
      error = '可靠性评分必须在1-10之间';
      return;
    }
    
    if (formData.installationDifficulty < 1 || formData.installationDifficulty > 10) {
      error = '安装难度评分必须在1-10之间';
      return;
    }
    
    if (formData.environmentalAdaptability < 1 || formData.environmentalAdaptability > 10) {
      error = '环境适应性评分必须在1-10之间';
      return;
    }

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
      
      // 显示成功消息
      const action = editingMedia ? '更新' : '添加';
      console.log(`成功${action}传输介质: ${formData.name}`);
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
          <!-- 基本信息 -->
          <div class="form-section-header">
            <h4>基本信息</h4>
            <p>配置传输介质的基本属性</p>
          </div>

          <div class="form-group">
            <label for="name">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM3.5 6.5h9a.5.5 0 010 1h-9a.5.5 0 010-1z"/>
              </svg>
              介质名称 *
            </label>
            <input
              id="name"
              type="text"
              bind:value={formData.name}
              placeholder="请输入介质名称，如：单模光纤"
              required
              autocomplete="off"
            />
            <small class="field-hint">用于识别和区分不同传输介质的名称</small>
          </div>

          <div class="form-group">
            <label for="type">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/>
              </svg>
              介质类型 *
            </label>
            <select id="type" bind:value={formData.type} required>
              <option value="">请选择介质类型</option>
              {#each Object.entries(MediaTypeLabels) as [value, label]}
                <option {value}>{label}</option>
              {/each}
            </select>
            <small class="field-hint">选择传输介质的技术类型</small>
          </div>

          <!-- 性能参数 -->
          <div class="form-section-header">
            <h4>性能参数</h4>
            <p>定义传输介质的技术规格和性能指标</p>
          </div>

          <div class="form-group">
            <label for="maxDistance">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2z"/>
              </svg>
              最大传输距离 (km) *
            </label>
            <input
              id="maxDistance"
              type="number"
              bind:value={formData.maxDistance}
              min="0"
              step="0.1"
              placeholder="0.0"
              required
            />
            <small class="field-hint">在无中继器情况下的最大传输距离</small>
          </div>

          <div class="form-group">
            <label for="maxBandwidth">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1112 0A6 6 0 012 8z"/>
              </svg>
              最大带宽 (Mbps) *
            </label>
            <input
              id="maxBandwidth"
              type="number"
              bind:value={formData.maxBandwidth}
              min="0"
              placeholder="0"
              required
            />
            <small class="field-hint">理论最大数据传输速率</small>
          </div>

          <div class="form-group">
            <label for="attenuation">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM3.5 6.5h9a.5.5 0 010 1h-9a.5.5 0 010-1z"/>
              </svg>
              信号衰减 (dB/km) *
            </label>
            <input
              id="attenuation"
              type="number"
              bind:value={formData.attenuation}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
            <small class="field-hint">每公里信号功率损失</small>
          </div>

          <div class="form-group">
            <label for="latency">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 4v4l3 2 1-1.5-2.5-1.5V4H7z"/>
              </svg>
              传输延迟 (ms/km) *
            </label>
            <input
              id="latency"
              type="number"
              bind:value={formData.latency}
              min="0"
              step="0.001"
              placeholder="0.000"
              required
            />
            <small class="field-hint">每公里传输时间延迟</small>
          </div>

          <!-- 质量评分 -->
          <div class="form-section-header">
            <h4>质量评分</h4>
            <p>评估传输介质的各项质量指标 (1-10分)</p>
          </div>

          <div class="form-group">
            <label for="reliability">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/>
              </svg>
              可靠性评分 (1-10) *
            </label>
            <div class="range-input-container">
              <input
                id="reliability"
                type="range"
                bind:value={formData.reliability}
                min="1"
                max="10"
                step="0.1"
                class="range-input"
              />
              <input
                type="number"
                bind:value={formData.reliability}
                min="1"
                max="10"
                step="0.1"
                class="range-number"
                required
              />
            </div>
            <small class="field-hint">系统稳定性和故障率评估</small>
          </div>

          <div class="form-group">
            <label for="installationDifficulty">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              </svg>
              安装难度 (1-10) *
            </label>
            <div class="range-input-container">
              <input
                id="installationDifficulty"
                type="range"
                bind:value={formData.installationDifficulty}
                min="1"
                max="10"
                step="0.1"
                class="range-input"
              />
              <input
                type="number"
                bind:value={formData.installationDifficulty}
                min="1"
                max="10"
                step="0.1"
                class="range-number"
                required
              />
            </div>
            <small class="field-hint">施工复杂程度和技术要求</small>
          </div>

          <div class="form-group">
            <label for="environmentalAdaptability">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM8 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"/>
              </svg>
              环境适应性 (1-10) *
            </label>
            <div class="range-input-container">
              <input
                id="environmentalAdaptability"
                type="range"
                bind:value={formData.environmentalAdaptability}
                min="1"
                max="10"
                step="0.1"
                class="range-input"
              />
              <input
                type="number"
                bind:value={formData.environmentalAdaptability}
                min="1"
                max="10"
                step="0.1"
                class="range-number"
                required
              />
            </div>
            <small class="field-hint">对恶劣环境的抗性能力</small>
          </div>

          <!-- 成本信息 -->
          <div class="form-section-header">
            <h4>成本信息</h4>
            <p>配置传输介质的经济成本参数</p>
          </div>

          <div class="form-group">
            <label for="costPerKm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
              </svg>
              建设成本 (元/km) *
            </label>
            <input
              id="costPerKm"
              type="number"
              bind:value={formData.costPerKm}
              min="0"
              placeholder="0"
              required
            />
            <small class="field-hint">每公里建设投入成本</small>
          </div>

          <div class="form-group">
            <label for="maintenanceCost">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
              </svg>
              维护成本 (元/年/km) *
            </label>
            <input
              id="maintenanceCost"
              type="number"
              bind:value={formData.maintenanceCost}
              min="0"
              placeholder="0"
              required
            />
            <small class="field-hint">每公里年度维护费用</small>
          </div>

          <!-- 状态控制 -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:checked={formData.isActive}
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                </svg>
                启用状态
              </span>
            </label>
            <small class="field-hint">控制此传输介质是否可用于网络规划</small>
          </div>
        </div>

        <!-- 应用场景选择 -->
        <div class="form-section scenarios-section">
          <div class="section-header">
            <h4>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
              </svg>
              适用场景
            </h4>
            <p>选择此传输介质适合使用的网络应用场景</p>
          </div>
          <div class="scenario-buttons">
            {#each Object.entries(ApplicationScenarioLabels) as [value, label]}
              <button
                type="button"
                class="scenario-btn {formData.applicationScenarios.includes(value) ? 'active' : ''}"
                onclick={() => toggleScenario(value)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  {#if formData.applicationScenarios.includes(value)}
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  {:else}
                    <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
                  {/if}
                </svg>
                {label}
              </button>
            {/each}
          </div>
        </div>

        <!-- 详细描述 -->
        <div class="form-section description-section">
          <div class="section-header">
            <h4>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
              </svg>
              详细信息
            </h4>
            <p>提供传输介质的详细技术规格和特性描述</p>
          </div>

          <div class="description-grid">
            <div class="form-group">
              <label for="specifications">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 4.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zM3 8a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9A.5.5 0 013 8zm0 3.5a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5z"/>
                </svg>
                技术规格
              </label>
              <textarea
                id="specifications"
                bind:value={formData.specifications}
                rows="4"
                placeholder="请输入详细的技术规格，如：工作波长、芯径、包层直径等..."
              ></textarea>
              <small class="field-hint">详细的技术参数和规格说明</small>
            </div>

            <div class="form-group">
              <label for="advantages">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                技术优势
              </label>
              <textarea
                id="advantages"
                bind:value={formData.advantages}
                rows="4"
                placeholder="请描述此传输介质的主要优势和特点..."
              ></textarea>
              <small class="field-hint">突出传输介质的优点和适用性</small>
            </div>

            <div class="form-group">
              <label for="disadvantages">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                使用限制
              </label>
              <textarea
                id="disadvantages"
                bind:value={formData.disadvantages}
                rows="4"
                placeholder="请描述使用此传输介质时需要注意的限制和缺点..."
              ></textarea>
              <small class="field-hint">说明使用限制和注意事项</small>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" onclick={closeForm}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="m5.354 4.646-1.414 1.414L6.586 8.5 3.94 11.146l1.414 1.414L8 9.914l2.646 2.646 1.414-1.414L9.414 8.5l2.646-2.646-1.414-1.414L8 7.086 5.354 4.646z"/>
            </svg>
            取消
          </button>
          <button type="submit" class="save-btn" disabled={loading}>
            {#if loading}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="loading-icon">
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z"/>
              </svg>
              {editingMedia ? '更新中...' : '保存中...'}
            {:else}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H9.5a1 1 0 0 0-1 1v7.293l2.646-2.647a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 9.293V2a2 2 0 0 1 2-2h3.5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h3.5a.5.5 0 0 1 0 1H2z"/>
              </svg>
              {editingMedia ? '更新介质' : '添加介质'}
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  /* CSS 自定义属性 */
  :root {
    --primary-50: #f0f4ff;
    --primary-100: #e5edff;
    --primary-500: #667eea;
    --primary-600: #5a6fd8;
    --primary-700: #4c5bc6;
    --primary-800: #3f47b4;
    
    --secondary-500: #764ba2;
    --secondary-600: #6a4190;
    
    --success-50: #f0fdf4;
    --success-100: #dcfce7;
    --success-500: #22c55e;
    --success-600: #16a34a;
    
    --warning-50: #fffbeb;
    --warning-100: #fef3c7;
    --warning-500: #f59e0b;
    --warning-600: #d97706;
    
    --error-50: #fef2f2;
    --error-100: #fee2e2;
    --error-500: #ef4444;
    --error-600: #dc2626;
    
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    --radius-sm: 0.375rem;
    --radius: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.5rem;
  }

  /* 全局样式重置 */
  .media-management {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: linear-gradient(135deg, var(--gray-50) 0%, var(--primary-50) 100%);
    min-height: 100vh;
  }

  /* 页面头部样式 */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2.5rem;
    background: white;
    padding: 2rem;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--gray-100);
  }

  .header-content h2 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-900);
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-content h2 svg {
    color: var(--primary-500);
  }

  .header-content p {
    margin: 0;
    color: var(--gray-600);
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .add-button {
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow);
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%);
  }

  .btn-primary {
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: var(--shadow);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* 错误提示样式 */
  .error-card {
    background: var(--error-50);
    border: 1px solid var(--error-200);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: var(--shadow-sm);
  }

  .error-icon {
    color: var(--error-500);
    flex-shrink: 0;
  }

  .error-content h4 {
    margin: 0 0 0.25rem 0;
    color: var(--error-700);
    font-size: 1.1rem;
    font-weight: 600;
  }

  .error-content p {
    margin: 0;
    color: var(--error-600);
    line-height: 1.5;
  }

  /* 加载状态样式 */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow);
    margin: 2rem 0;
  }

  .loading-spinner {
    color: var(--primary-500);
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .loading-container p {
    color: var(--gray-600);
    font-size: 1.1rem;
    margin: 0;
  }

  /* 介质网格样式 */
  .media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 1.5rem;
  }

  /* 介质卡片样式 */
  .media-card {
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-xl);
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: var(--shadow);
  }

  .media-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary-200);
  }

  .media-card.inactive {
    opacity: 0.7;
    border-color: var(--gray-300);
  }

  .media-card.inactive:hover {
    opacity: 0.9;
  }

  /* 卡片头部样式 */
  .card-header {
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
    color: white;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .card-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  }

  .media-icon {
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-md);
    padding: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .media-info {
    flex: 1;
    margin-left: 1rem;
    position: relative;
    z-index: 1;
  }

  .media-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.4;
  }

  .media-type {
    font-size: 0.875rem;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.25);
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius);
    display: inline-block;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--error-400);
  }

  .status-badge.active .status-dot {
    background: var(--success-400);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* 规格概览样式 */
  .specs-overview {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-100);
  }

  .spec-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
  }

  .spec-icon {
    color: var(--primary-500);
    background: var(--primary-50);
    padding: 0.5rem;
    border-radius: var(--radius);
  }

  .spec-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .spec-label {
    font-size: 0.875rem;
    color: var(--gray-500);
    font-weight: 500;
  }

  .spec-value {
    font-size: 1rem;
    color: var(--gray-900);
    font-weight: 600;
  }

  /* 性能指标样式 */
  .performance-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-100);
  }

  .performance-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-900);
  }

  .performance-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .performance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .performance-label {
    font-size: 0.875rem;
    color: var(--gray-600);
    font-weight: 500;
  }

  /* 星级评分样式 */
  .star-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .star {
    color: var(--gray-300);
    transition: color 0.2s ease;
  }

  .star.filled {
    color: var(--warning-500);
  }

  .rating-value {
    margin-left: 0.5rem;
    font-size: 0.875rem;
    color: var(--gray-600);
    font-weight: 600;
  }

  /* 进度条样式 */
  .progress-bar {
    position: relative;
    background: var(--gray-200);
    border-radius: var(--radius);
    height: 8px;
    width: 100px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: var(--radius);
    transition: all 0.3s ease;
    position: relative;
  }

  .progress-value {
    margin-left: 0.75rem;
    font-size: 0.875rem;
    color: var(--gray-600);
    font-weight: 600;
  }

  /* 应用场景样式 */
  .scenarios-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-100);
  }

  .scenarios-section h4 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--gray-900);
  }

  .scenario-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .scenario-tag {
    background: var(--success-100);
    color: var(--success-700);
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid var(--success-200);
  }

  /* 描述信息样式 */
  .description-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--gray-100);
  }

  .description-item {
    margin-bottom: 1rem;
  }

  .description-item:last-child {
    margin-bottom: 0;
  }

  .description-item h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .advantages h5 {
    color: var(--success-700);
  }

  .advantages h5 svg {
    color: var(--success-500);
  }

  .disadvantages h5 {
    color: var(--warning-700);
  }

  .disadvantages h5 svg {
    color: var(--warning-500);
  }

  .description-item p {
    margin: 0;
    color: var(--gray-600);
    line-height: 1.6;
    font-size: 0.95rem;
  }

  /* 卡片操作按钮样式 */
  .card-actions {
    padding: 1rem 1.5rem;
    background: var(--gray-50);
    display: flex;
    gap: 0.75rem;
  }

  .action-button {
    padding: 0.625rem 1rem;
    border: 1px solid;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    justify-content: center;
  }

  .action-button.edit {
    background: var(--primary-50);
    color: var(--primary-700);
    border-color: var(--primary-200);
  }

  .action-button.edit:hover {
    background: var(--primary-100);
    border-color: var(--primary-300);
    transform: translateY(-1px);
  }

  .action-button.delete {
    background: var(--error-50);
    color: var(--error-700);
    border-color: var(--error-200);
  }

  .action-button.delete:hover {
    background: var(--error-100);
    border-color: var(--error-300);
    transform: translateY(-1px);
  }

  /* 空状态样式 */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow);
    margin: 2rem 0;
  }

  .empty-icon {
    color: var(--gray-400);
    margin-bottom: 1.5rem;
  }

  .empty-state h3 {
    margin: 0 0 0.75rem 0;
    color: var(--gray-900);
    font-size: 1.5rem;
    font-weight: 600;
  }

  .empty-state p {
    margin: 0 0 2rem 0;
    color: var(--gray-600);
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .empty-action {
    margin: 0 auto;
  }

  /* 模态框样式 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: white;
    border-radius: var(--radius-xl);
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    width: 100%;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--gray-200);
  }

  .modal-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
    color: white;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--radius);
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* 表单样式 */
  form {
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
  }

  /* 表单分组头部 */
  .form-section-header {
    grid-column: 1 / -1;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--gray-200);
    margin-bottom: 1rem;
  }

  .form-section-header h4 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-900);
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-section-header p {
    margin: 0;
    color: var(--gray-600);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* 表单分组样式 */
  .form-section {
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    border: 1px solid var(--gray-200);
  }

  .section-header {
    margin-bottom: 1.5rem;
  }

  .section-header h4 {
    margin: 0 0 0.5rem 0;
    color: var(--gray-900);
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-header p {
    margin: 0;
    color: var(--gray-600);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    font-weight: 600;
    color: var(--gray-700);
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .form-group label[for] {
    cursor: pointer;
  }

  .form-group label svg {
    color: var(--primary-500);
    flex-shrink: 0;
  }

  /* 输入框样式 */
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 0.875rem 1rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: all 0.2s ease;
    background: white;
    font-family: inherit;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary-500);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-group input:invalid,
  .form-group select:invalid,
  .form-group textarea:invalid {
    border-color: var(--error-300);
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: var(--gray-400);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }

  /* 字段提示样式 */
  .field-hint {
    font-size: 0.85rem;
    color: var(--gray-500);
    line-height: 1.4;
    margin-top: 0.25rem;
  }

  /* 范围输入样式 */
  .range-input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .range-input {
    flex: 1;
    height: 8px;
    border-radius: var(--radius);
    background: var(--gray-200);
    outline: none;
    appearance: none;
    cursor: pointer;
  }

  .range-input::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-500);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: var(--shadow);
  }

  .range-input::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary-500);
    cursor: pointer;
    border: 3px solid white;
    box-shadow: var(--shadow);
  }

  .range-number {
    width: 80px;
    text-align: center;
    padding: 0.5rem;
    border: 2px solid var(--gray-200);
    border-radius: var(--radius);
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* 复选框样式 */
  .checkbox-group {
    margin: 1.5rem 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-weight: 600;
    color: var(--gray-700);
  }

  .checkbox-input {
    display: none;
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gray-300);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: white;
  }

  .checkbox-input:checked + .checkbox-custom {
    background: var(--primary-500);
    border-color: var(--primary-500);
  }

  .checkbox-input:checked + .checkbox-custom::after {
    content: '✓';
    color: white;
    font-size: 14px;
    font-weight: bold;
  }

  .checkbox-text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* 场景选择样式 */
  .scenarios-section {
    grid-column: 1 / -1;
  }

  .scenario-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .scenario-btn {
    padding: 0.875rem 1rem;
    border: 2px solid var(--gray-300);
    background: white;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    text-align: center;
  }

  .scenario-btn:hover {
    border-color: var(--primary-400);
    background-color: var(--primary-50);
    color: var(--primary-700);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  .scenario-btn.active {
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
    color: white;
    border-color: var(--primary-500);
    box-shadow: var(--shadow);
  }

  .scenario-btn.active:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* 描述区域样式 */
  .description-section {
    grid-column: 1 / -1;
  }

  .description-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  /* 表单操作按钮样式 */
  .form-actions {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--gray-200);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    background: var(--gray-50);
  }

  .cancel-btn,
  .save-btn {
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 120px;
    justify-content: center;
  }

  .cancel-btn {
    background: white;
    color: var(--gray-700);
    border: 2px solid var(--gray-300);
  }

  .cancel-btn:hover {
    background: var(--gray-50);
    border-color: var(--gray-400);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  .save-btn {
    background: linear-gradient(135deg, var(--primary-500) 0%, var(--secondary-500) 100%);
    color: white;
    box-shadow: var(--shadow);
  }

  .save-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .save-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-sm);
  }

  .loading-icon {
    animation: spin 1s linear infinite;
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .media-grid {
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .media-management {
      padding: 1rem;
    }

    .page-header {
      flex-direction: column;
      gap: 1.5rem;
      align-items: stretch;
      text-align: center;
      padding: 1.5rem;
    }

    .header-content h2 {
      font-size: 1.75rem;
      justify-content: center;
    }

    .media-grid {
      grid-template-columns: 1fr;
    }

    .form-grid {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.5rem;
    }

    .form-actions button {
      width: 100%;
      justify-content: center;
    }

    .scenario-buttons {
      grid-template-columns: 1fr;
    }

    .description-grid {
      grid-template-columns: 1fr;
    }

    .performance-grid {
      gap: 1.5rem;
    }

    .performance-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .progress-bar {
      width: 100%;
    }

    .star-rating {
      justify-content: flex-start;
    }
  }

  @media (max-width: 480px) {
    .media-management {
      padding: 0.75rem;
    }

    .page-header {
      padding: 1.25rem;
    }

    .header-content h2 {
      font-size: 1.5rem;
    }

    .modal {
      margin: 0.5rem;
      max-height: 95vh;
    }

    .form-grid {
      padding: 1rem;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
    }

    .form-actions {
      padding: 1.25rem 1.5rem;
    }

    .specs-overview {
      padding: 1.25rem;
    }

    .performance-section,
    .scenarios-section,
    .description-section {
      padding: 1.25rem;
    }

    .card-actions {
      padding: 1rem 1.25rem;
      flex-direction: column;
      gap: 0.5rem;
    }

    .action-button {
      justify-content: center;
    }
  }

  /* 动画和过渡效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .media-card {
    animation: fadeIn 0.3s ease-out;
  }

  .modal {
    animation: slideUp 0.3s ease-out;
  }

  /* 滚动条样式 */
  form::-webkit-scrollbar {
    width: 8px;
  }

  form::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius);
  }

  form::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: var(--radius);
  }

  form::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }

  /* 打印样式 */
  @media print {
    .media-management {
      padding: 0;
      background: white;
    }

    .page-header {
      box-shadow: none;
      border: 1px solid var(--gray-300);
    }

    .add-button {
      display: none;
    }

    .media-card {
      break-inside: avoid;
      box-shadow: none;
      border: 1px solid var(--gray-300);
    }

    .card-actions {
      display: none;
    }

    .modal-overlay {
      display: none;
    }
  }
</style>
