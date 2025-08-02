<script lang="ts">
  import MediaManagement from './components/MediaManagement.svelte';
  import RecommendationEngine from './components/RecommendationEngine.svelte';

  let activeTab = 'recommendation';
</script>

<main>
  <header>
    <h1>🌐 网络链路规划师</h1>
    <p>智能化网络传输介质选型系统</p>
  </header>

  <nav class="tabs">
    <button
      class="tab {activeTab === 'recommendation' ? 'active' : ''}"
      onclick={() => activeTab = 'recommendation'}
    >
      🎯 智能推荐
    </button>
    <button
      class="tab {activeTab === 'management' ? 'active' : ''}"
      onclick={() => activeTab = 'management'}
    >
      📊 介质管理
    </button>
  </nav>

  <div class="content">
    {#if activeTab === 'recommendation'}
      <RecommendationEngine />
    {:else if activeTab === 'management'}
      <MediaManagement />
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  header h1 {
    margin: 0 0 10px 0;
    font-size: 2.5rem;
    font-weight: 700;
  }

  header p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    border-bottom: 2px solid #e1e5e9;
  }

  .tab {
    padding: 12px 24px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    color: #6c757d;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
  }

  .tab:hover {
    color: #495057;
    background-color: #f8f9fa;
  }

  .tab.active {
    color: #667eea;
    border-bottom-color: #667eea;
    background-color: #f8f9ff;
  }

  .content {
    min-height: 500px;
  }
</style>
