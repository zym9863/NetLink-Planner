<script lang="ts">
  import MediaManagement from './components/MediaManagement.svelte';
  import RecommendationEngine from './components/RecommendationEngine.svelte';

  let activeTab = 'recommendation';

  // 添加页面切换动画
  function switchTab(tab: string) {
    if (activeTab !== tab) {
      activeTab = tab;
    }
  }
</script>

<main class="app-container">
  <!-- 头部区域 -->
  <header class="app-header">
    <div class="header-content">
      <div class="brand">
        <div class="brand-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill="url(#gradient1)" opacity="0.2"/>
            <path d="M12 24h6m6 0h6m6 0h6M24 12v6m0 6v6m0 6v6" 
                  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="24" cy="24" r="3" fill="currentColor"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea"/>
                <stop offset="100%" style="stop-color:#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="brand-text">
          <h1>网络链路规划师</h1>
          <p>智能化网络传输介质选型系统</p>
        </div>
      </div>
      
      <!-- 状态指示器 -->
      <div class="status-indicator">
        <div class="status-dot"></div>
        <span>系统运行正常</span>
      </div>
    </div>
  </header>

  <!-- 导航标签 -->
  <nav class="navigation">
    <div class="nav-container">
      <div class="nav-tabs">
        <button
          class="nav-tab"
          class:active={activeTab === 'recommendation'}
          on:click={() => switchTab('recommendation')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>智能推荐</span>
        </button>
        
        <button
          class="nav-tab"
          class:active={activeTab === 'management'}
          on:click={() => switchTab('management')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span>介质管理</span>
        </button>
      </div>
    </div>
  </nav>

  <!-- 内容区域 -->
  <div class="content-area">
    <div class="content-container">
      {#if activeTab === 'recommendation'}
        <div class="tab-content" key="recommendation">
          <RecommendationEngine />
        </div>
      {:else if activeTab === 'management'}
        <div class="tab-content" key="management">
          <MediaManagement />
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--gray-50);
  }

  /* 头部样式 */
  .app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    position: relative;
    overflow: hidden;
  }

  .app-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  .header-content {
    position: relative;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
  }

  .brand-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-2xl);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .brand-text h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .brand-text p {
    margin: var(--space-xs) 0 0 0;
    font-size: 1.125rem;
    opacity: 0.9;
    font-weight: 400;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    background: rgba(255, 255, 255, 0.15);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-xl);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }

  .status-indicator span {
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* 导航样式 */
  .navigation {
    background: white;
    border-bottom: 1px solid var(--gray-200);
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: var(--shadow-sm);
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  .nav-tabs {
    display: flex;
    gap: var(--space-sm);
  }

  .nav-tab {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-xl);
    border: none;
    background: none;
    color: var(--gray-600);
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: var(--transition-base);
    position: relative;
  }

  .nav-tab::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--primary-50);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    opacity: 0;
    transition: var(--transition-base);
  }

  .nav-tab svg {
    position: relative;
    z-index: 1;
  }

  .nav-tab span {
    position: relative;
    z-index: 1;
  }

  .nav-tab:hover {
    color: var(--primary-600);
  }

  .nav-tab:hover::before {
    opacity: 0.5;
  }

  .nav-tab.active {
    color: var(--primary-600);
    border-bottom-color: var(--primary-600);
  }

  .nav-tab.active::before {
    opacity: 1;
  }

  /* 内容区域 */
  .content-area {
    flex: 1;
    padding: var(--space-xl) 0;
  }

  .content-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  .tab-content {
    animation: fadeInUp 0.4s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: var(--space-lg);
      text-align: center;
    }

    .brand {
      flex-direction: column;
      gap: var(--space-md);
    }

    .brand-text h1 {
      font-size: 2rem;
    }

    .brand-text p {
      font-size: 1rem;
    }

    .nav-tabs {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .nav-tab {
      white-space: nowrap;
      min-width: fit-content;
    }

    .content-container {
      padding: 0 var(--space-md);
    }
  }

  @media (max-width: 480px) {
    .brand-icon {
      width: 48px;
      height: 48px;
    }

    .brand-text h1 {
      font-size: 1.75rem;
    }

    .nav-tab {
      padding: var(--space-md) var(--space-lg);
      font-size: 0.875rem;
    }
  }
</style>
