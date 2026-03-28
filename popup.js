// 久坐提醒助手 - Popup 交互逻辑 v2.0
// 支持普通模式、番茄模式、音效开关、活动统计

document.addEventListener('DOMContentLoaded', async () => {
  // DOM 元素
  const timerDisplay = document.getElementById('timerDisplay');
  const timerLabel = document.getElementById('timerLabel');
  const timerStatus = document.getElementById('timerStatus');
  const timerPhase = document.getElementById('timerPhase');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const intervalSelect = document.getElementById('intervalSelect');
  const normalSettings = document.getElementById('normalSettings');
  const pomodoroSettings = document.getElementById('pomodoroSettings');
  const soundToggle = document.getElementById('soundToggle');
  const modeTabs = document.querySelectorAll('.mode-tab');
  const tipsSection = document.getElementById('tipsSection');
  
  // 统计元素
  const statActivity = document.getElementById('statActivity');
  const statPomodoro = document.getElementById('statPomodoro');
  const statFocus = document.getElementById('statFocus');

  // 状态变量
  let countdownInterval = null;
  let isRunning = false;
  let isPaused = false;        // 是否处于暂停状态
  let pausedRemainingTime = 0; // 暂停时剩余的毫秒数
  let currentMode = 'normal';  // 'normal' | 'pomodoro'
  let currentPhase = null;     // 'work' | 'break' | null
  let stats = { activityCount: 0, pomodoroCompleted: 0, totalWorkMinutes: 0 };

  // 初始化
  await init();

  // 绑定事件
  startBtn.addEventListener('click', handleStart);
  pauseBtn.addEventListener('click', handlePause);
  soundToggle.addEventListener('change', handleSoundToggle);
  
  // 模式切换
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => handleModeSwitch(tab.dataset.mode));
  });

  // 初始化函数
  async function init() {
    try {
      const response = await sendMessage({ action: 'getStatus' });
      
      if (response.error) {
        console.error('获取状态失败:', response.error);
        updateUI('stopped');
        return;
      }

      // 恢复设置
      currentMode = response.mode || 'normal';
      intervalSelect.value = response.intervalMinutes || 60;
      soundToggle.checked = response.soundEnabled !== false;
      
      // 更新统计
      if (response.stats) {
        stats = response.stats;
        updateStatsDisplay();
      }

      // 更新模式 UI
      updateModeUI(currentMode);

      // 恢复运行状态
      if (response.isRunning) {
        isRunning = true;
        isPaused = false;
        currentPhase = response.pomodoroPhase;
        intervalSelect.disabled = true;
        updateUI('running');
        startCountdown(response.remainingTime);
      } else {
        isRunning = false;
        isPaused = false;
        updateUI('stopped');
        // 显示默认倒计时
        updateTimerDisplayForMode();
      }
    } catch (error) {
      console.error('初始化失败:', error);
      updateUI('stopped');
    }
  }

  // 处理模式切换
  async function handleModeSwitch(mode) {
    if (isRunning) {
      // 运行中不允许切换模式，显示提示
      timerStatus.textContent = '⚠️ 请先暂停或重置后再切换模式';
      timerStatus.style.color = '#f44336';
      setTimeout(() => {
        timerStatus.style.color = '';
        if (isRunning) {
          timerStatus.textContent = currentMode === 'pomodoro' 
            ? '番茄钟运行中...' 
            : '提醒运行中...';
        }
      }, 2000);
      return;
    }
    
    currentMode = mode;
    updateModeUI(mode);
    updateTimerDisplayForMode();
  }

  // 更新模式 UI
  function updateModeUI(mode) {
    modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    
    if (mode === 'normal') {
      normalSettings.style.display = 'block';
      pomodoroSettings.style.display = 'none';
      tipsSection.querySelector('.tips-text').textContent = '💡 建议每 60 分钟起身活动 5-10 分钟';
    } else {
      normalSettings.style.display = 'none';
      pomodoroSettings.style.display = 'block';
      tipsSection.querySelector('.tips-text').textContent = '💡 番茄工作法：25分钟专注 + 5分钟休息';
    }
  }

  // 根据模式更新计时器显示
  function updateTimerDisplayForMode() {
    if (currentMode === 'normal') {
      const minutes = parseInt(intervalSelect.value);
      timerDisplay.textContent = formatTime(minutes * 60 * 1000);
      timerLabel.textContent = '⏱️ 剩余时间';
      timerPhase.textContent = '';
      timerPhase.className = 'timer-phase';
      timerDisplay.className = 'timer-display';
    } else {
      timerDisplay.textContent = '25:00';
      timerLabel.textContent = '🍅 番茄钟';
      timerPhase.textContent = '准备开始工作时段';
      timerPhase.className = 'timer-phase';
      timerDisplay.className = 'timer-display pomodoro-work';
    }
  }

  // 处理开始按钮
  async function handleStart() {
    try {
      // 如果是暂停状态恢复，使用保存的剩余时间
      if (isPaused) {
        isRunning = true;
        isPaused = false;
        updateUI('running');
        startCountdown(pausedRemainingTime);
        return;
      }

      let response;
      
      if (currentMode === 'normal') {
        const minutes = parseInt(intervalSelect.value);
        response = await sendMessage({ 
          action: 'start', 
          minutes: minutes 
        });
      } else {
        response = await sendMessage({ action: 'startPomodoro' });
      }

      if (response.error) {
        console.error('启动失败:', response.error);
        timerStatus.textContent = '启动失败，请重试';
        return;
      }

      isRunning = true;
      isPaused = false;
      intervalSelect.disabled = true;
      
      if (currentMode === 'pomodoro') {
        currentPhase = 'work';
      }
      
      updateUI('running');
      
      // 启动倒计时
      const initialTime = currentMode === 'normal' 
        ? parseInt(intervalSelect.value) * 60 * 1000
        : 25 * 60 * 1000;
      startCountdown(initialTime);
      
    } catch (error) {
      console.error('启动失败:', error);
    }
  }

  // 处理暂停/重置按钮
  async function handlePause() {
    try {
      if (isPaused) {
        // 当前是"重置"状态，执行重置操作
        isRunning = false;
        isPaused = false;
        pausedRemainingTime = 0;
        
        // 停止后台闹钟
        await sendMessage({ action: 'stop' });
        
        intervalSelect.disabled = false;
        updateUI('stopped');
        stopCountdown();
        updateTimerDisplayForMode();
        
      } else {
        // 当前是"暂停"状态，执行暂停操作（保留剩余时间）
        // 保存当前剩余时间
        const timeText = timerDisplay.textContent;
        const [minutes, seconds] = timeText.split(':').map(Number);
        pausedRemainingTime = (minutes * 60 + seconds) * 1000;
        
        // 停止后台闹钟，但保留倒计时显示
        await sendMessage({ action: 'stop' });
        
        isRunning = false;
        isPaused = true;
        stopCountdown();
        updateUI('paused');
        // 保留当前显示的时间
      }
    } catch (error) {
      console.error('暂停/重置失败:', error);
    }
  }

  // 处理音效开关
  async function handleSoundToggle() {
    try {
      await sendMessage({ action: 'toggleSound' });
    } catch (error) {
      console.error('切换音效失败:', error);
    }
  }

  // 启动倒计时
  function startCountdown(remainingMs) {
    stopCountdown();

    let endTime = Date.now() + remainingMs;
    let lastRemaining = remainingMs;

    updateTimerDisplay(remainingMs);
    updatePhaseUI();

    countdownInterval = setInterval(async () => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        updateTimerDisplay(0);
        
        // 倒计时结束，检查是否需要切换阶段
        if (currentMode === 'pomodoro') {
          // 番茄模式会自动切换，等待后台更新状态
          timerStatus.textContent = '时间到了！';
          timerDisplay.classList.add('finished');
          
          // 刷新状态获取新阶段
          setTimeout(async () => {
            const response = await sendMessage({ action: 'getStatus' });
            if (response.isRunning) {
              currentPhase = response.pomodoroPhase;
              endTime = Date.now() + response.remainingTime;
              updatePhaseUI();
              timerDisplay.classList.remove('finished');
            }
          }, 2000);
        } else {
          // 普通模式，显示完成
          timerDisplay.classList.add('finished');
          timerStatus.textContent = '时间到了！请起来活动一下';
          
          // 更新统计
          setTimeout(async () => {
            const response = await sendMessage({ action: 'getStats' });
            if (response.stats) {
              stats = response.stats;
              updateStatsDisplay();
            }
          }, 1000);
          
          // 获取新的剩余时间（下一周期）
          setTimeout(async () => {
            try {
              const response = await sendMessage({ action: 'getRemainingTime' });
              if (response.remainingTime > 0) {
                endTime = Date.now() + response.remainingTime;
                timerDisplay.classList.remove('finished');
              }
            } catch (error) {
              console.error('获取剩余时间失败:', error);
            }
          }, 2000);
        }
      } else {
        updateTimerDisplay(remaining);
        lastRemaining = remaining;
      }
    }, 1000);
  }

  // 更新阶段 UI
  function updatePhaseUI() {
    if (currentMode === 'pomodoro' && currentPhase) {
      if (currentPhase === 'work') {
        timerPhase.textContent = '🔥 工作时段 - 保持专注';
        timerPhase.className = 'timer-phase work';
        timerDisplay.className = 'timer-display pomodoro-work';
        timerLabel.textContent = '💼 工作时间';
      } else {
        timerPhase.textContent = '☕ 休息时段 - 放松身心';
        timerPhase.className = 'timer-phase break';
        timerDisplay.className = 'timer-display pomodoro-break';
        timerLabel.textContent = '🧘 休息时间';
      }
    }
  }

  // 停止倒计时
  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  // 更新计时器显示
  function updateTimerDisplay(ms) {
    timerDisplay.textContent = formatTime(ms);
  }

  // 格式化时间
  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
  }

  function pad(num) {
    return num.toString().padStart(2, '0');
  }

  // 更新统计显示
  function updateStatsDisplay() {
    statActivity.textContent = stats.activityCount || 0;
    statPomodoro.textContent = stats.pomodoroCompleted || 0;
    statFocus.textContent = stats.totalWorkMinutes || 0;
  }

  // 更新 UI 状态
  function updateUI(state) {
    timerDisplay.classList.remove('running', 'paused');

    switch (state) {
      case 'running':
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        pauseBtn.querySelector('.btn-text').textContent = '暂停';
        pauseBtn.querySelector('.btn-icon').textContent = '⏸';
        timerDisplay.classList.add('running');
        timerStatus.textContent = currentMode === 'pomodoro' 
          ? '番茄钟运行中...' 
          : '提醒运行中...';
        break;

      case 'paused':
        startBtn.disabled = false;
        startBtn.querySelector('.btn-text').textContent = '继续';
        startBtn.querySelector('.btn-icon').textContent = '▶';
        pauseBtn.disabled = false;
        pauseBtn.querySelector('.btn-text').textContent = '重置';
        pauseBtn.querySelector('.btn-icon').textContent = '↺';
        timerDisplay.classList.add('paused');
        timerStatus.textContent = '已暂停 - 点击继续或重置';
        break;

      case 'stopped':
      default:
        startBtn.disabled = false;
        startBtn.querySelector('.btn-text').textContent = '开始';
        startBtn.querySelector('.btn-icon').textContent = '▶';
        pauseBtn.disabled = true;
        pauseBtn.querySelector('.btn-text').textContent = '暂停';
        pauseBtn.querySelector('.btn-icon').textContent = '⏸';
        timerStatus.textContent = '点击开始按钮启动';
        break;
    }
  }

  // 发送消息
  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { error: '无响应' });
      });
    });
  }

  // 页面关闭时清理
  window.addEventListener('unload', () => {
    stopCountdown();
  });
});
