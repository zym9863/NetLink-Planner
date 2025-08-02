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
</script>

<div class="media-management">
  <div class="header">
    <h2>📊 传输介质管理</h2>
    <button class="add-btn" onclick={openCreateForm}>
      ➕ 添加介质
    </button>
  </div>

  {#if error}
    <div class="error">
      ❌ {error}
    </div>
  {/if}

  {#if loading}
    <div class="loading">
      🔄 加载中...
    </div>
  {/if}

  <div class="media-grid">
    {#each mediaList as media (media.id)}
      <div class="media-card {!media.isActive ? 'inactive' : ''}">
        <div class="card-header">
          <h3>{media.name}</h3>
          <span class="type-badge">{MediaTypeLabels[media.type]}</span>
        </div>

        <div class="card-content">
          <div class="specs">
            <div class="spec-row">
              <span>最大距离:</span>
              <span>{media.maxDistance} km</span>
            </div>
            <div class="spec-row">
              <span>最大带宽:</span>
              <span>{media.maxBandwidth.toLocaleString()} Mbps</span>
            </div>
            <div class="spec-row">
              <span>成本:</span>
              <span>{formatCurrency(media.costPerKm)}/km</span>
            </div>
            <div class="spec-row">
              <span>可靠性:</span>
              <span>{media.reliability}/10</span>
            </div>
            <div class="spec-row">
              <span>安装难度:</span>
              <span>{media.installationDifficulty}/10</span>
            </div>
          </div>

          <div class="scenarios">
            <strong>应用场景:</strong>
            <div class="scenario-tags">
              {#each media.applicationScenarios as scenario}
                <span class="scenario-tag">
                  {ApplicationScenarioLabels[scenario]}
                </span>
              {/each}
            </div>
          </div>

          {#if media.advantages}
            <div class="description">
              <strong>优势:</strong> {media.advantages}
            </div>
          {/if}

          {#if media.disadvantages}
            <div class="description">
              <strong>劣势:</strong> {media.disadvantages}
            </div>
          {/if}
        </div>

        <div class="card-actions">
          <button class="edit-btn" onclick={() => openEditForm(media)}>
            ✏️ 编辑
          </button>
          <button class="delete-btn" onclick={() => deleteMedia(media.id)}>
            🗑️ 删除
          </button>
        </div>
      </div>
    {/each}
  </div>

  {#if mediaList.length === 0 && !loading}
    <div class="empty-state">
      <p>📭 暂无传输介质数据</p>
      <button class="add-btn" onclick={openCreateForm}>
        添加第一个介质
      </button>
    </div>
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
