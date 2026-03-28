// 久坐提醒助手 - Service Worker (v2.0)
// 功能：计时提醒、音效、活动统计、番茄模式

const ALARM_NAME = 'sedentaryReminder';
const POMODORO_WORK_ALARM = 'pomodoroWork';
const POMODORO_BREAK_ALARM = 'pomodoroBreak';
const STORAGE_KEY = 'sedentarySettings';
const STATS_KEY = 'sedentaryStats';

// 默认设置
const DEFAULT_SETTINGS = {
  mode: 'normal',           // 'normal' | 'pomodoro'
  intervalMinutes: 60,      // 普通模式间隔
  isRunning: false,
  lastStartTime: null,
  nextReminderTime: null,
  soundEnabled: true,       // 音效开关
  pomodoroWorkMinutes: 25,  // 番茄工作时长
  pomodoroBreakMinutes: 5,  // 番茄休息时长
  pomodoroCycle: 0          // 当前番茄周期数
};

// 默认统计
const DEFAULT_STATS = {
  today: new Date().toDateString(),
  activityCount: 0,         // 今日活动次数
  pomodoroCompleted: 0,     // 今日完成番茄数
  totalWorkMinutes: 0       // 今日专注时长(分钟)
};

// 音效对象（懒加载）
let audioContext = null;

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('久坐提醒助手 v2.0 已安装');
  chrome.storage.local.set({ 
    [STORAGE_KEY]: DEFAULT_SETTINGS,
    [STATS_KEY]: DEFAULT_STATS 
  });
});

// 检查并重置每日统计
async function checkAndResetDailyStats() {
  const stats = await getStats();
  const today = new Date().toDateString();
  
  if (stats.today !== today) {
    // 新的一天，重置统计
    const newStats = { ...DEFAULT_STATS, today };
    await saveStats(newStats);
    console.log('新的一天，统计已重置');
    return newStats;
  }
  return stats;
}

// ========== 音效功能 ==========

// 播放提示音
async function playNotificationSound(type = 'notification') {
  const settings = await getSettings();
  if (!settings.soundEnabled) return;

  try {
    // 使用 Web Audio API 播放内置音效
    const audioUrl = type === 'ding' 
      ? chrome.runtime.getURL('ding.mp3')
      : chrome.runtime.getURL('notification.mp3');
    
    // 创建音频元素播放
    // 注意：Service Worker 中不能直接播放音频，需要特殊处理
    // 使用 chrome.offscreen API 或通过通知实现
    
    // 方案：使用 data URI 嵌入简单音效
    await playBeepSound(type);
  } catch (error) {
    console.error('播放音效失败:', error);
  }
}

// 使用 Web Audio API 生成提示音
async function playBeepSound(type = 'notification') {
  try {
    // 使用 offscreen document 播放音频（Manifest V3 推荐方式）
    await createOffscreenDocument();
    await chrome.runtime.sendMessage({ 
      action: 'playSound', 
      soundType: type 
    });
  } catch (error) {
    console.log('音效播放跳过:', error.message);
  }
}

// 创建离屏文档用于播放音频
let offscreenDocumentCreating = false;
async function createOffscreenDocument() {
  if (offscreenDocumentCreating) return;
  
  // 检查是否已存在
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });
  
  if (existingContexts.length > 0) {
    return; // 已存在
  }
  
  offscreenDocumentCreating = true;
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: '播放提醒音效'
    });
  } catch (error) {
    console.log('离屏文档创建失败(可能已存在):', error.message);
  } finally {
    offscreenDocumentCreating = false;
  }
}

// ========== 普通模式 ==========

async function startNormalReminder(minutes) {
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: minutes,
    periodInMinutes: minutes
  });
  
  const settings = await getSettings();
  const now = Date.now();
  
  settings.mode = 'normal';
  settings.intervalMinutes = minutes;
  settings.isRunning = true;
  settings.lastStartTime = now;
  settings.nextReminderTime = now + minutes * 60 * 1000;
  
  await saveSettings(settings);
  console.log(`普通模式已启动，间隔 ${minutes} 分钟`);
}

// ========== 番茄模式 ==========

async function startPomodoroMode() {
  const settings = await getSettings();
  
  // 先清除可能存在的闹钟
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.clear(POMODORO_WORK_ALARM);
  await chrome.alarms.clear(POMODORO_BREAK_ALARM);
  
  // 创建工作时段闹钟
  await chrome.alarms.create(POMODORO_WORK_ALARM, {
    delayInMinutes: settings.pomodoroWorkMinutes
  });
  
  const now = Date.now();
  settings.mode = 'pomodoro';
  settings.isRunning = true;
  settings.lastStartTime = now;
  settings.nextReminderTime = now + settings.pomodoroWorkMinutes * 60 * 1000;
  settings.pomodoroPhase = 'work';  // 'work' | 'break'
  
  await saveSettings(settings);
  console.log('番茄模式已启动，工作时段 25 分钟');
  
  // 播放开始音效
  await playNotificationSound('ding');
}

async function switchPomodoroPhase() {
  const settings = await getSettings();
  const stats = await checkAndResetDailyStats();
  
  if (settings.pomodoroPhase === 'work') {
    // 工作时段结束，进入休息时段
    await chrome.alarms.clear(POMODORO_WORK_ALARM);
    await chrome.alarms.create(POMODORO_BREAK_ALARM, {
      delayInMinutes: settings.pomodoroBreakMinutes
    });
    
    settings.pomodoroPhase = 'break';
    settings.nextReminderTime = Date.now() + settings.pomodoroBreakMinutes * 60 * 1000;
    
    // 更新统计
    stats.pomodoroCompleted++;
    stats.totalWorkMinutes += settings.pomodoroWorkMinutes;
    await saveStats(stats);
    
    await saveSettings(settings);
    
    // 显示休息通知
    showPomodoroNotification('break');
    await playNotificationSound('notification');
    
    console.log('番茄模式：进入休息时段 5 分钟');
  } else {
    // 休息时段结束，进入新的工作时段
    await chrome.alarms.clear(POMODORO_BREAK_ALARM);
    await chrome.alarms.create(POMODORO_WORK_ALARM, {
      delayInMinutes: settings.pomodoroWorkMinutes
    });
    
    settings.pomodoroPhase = 'work';
    settings.pomodoroCycle++;
    settings.nextReminderTime = Date.now() + settings.pomodoroWorkMinutes * 60 * 1000;
    
    await saveSettings(settings);
    
    // 显示工作通知
    showPomodoroNotification('work');
    await playNotificationSound('ding');
    
    console.log(`番茄模式：第 ${settings.pomodoroCycle + 1} 轮工作时段开始`);
  }
}

// ========== 停止功能 ==========

async function stopReminder() {
  await chrome.alarms.clear(ALARM_NAME);
  await chrome.alarms.clear(POMODORO_WORK_ALARM);
  await chrome.alarms.clear(POMODORO_BREAK_ALARM);
  
  const settings = await getSettings();
  settings.isRunning = false;
  settings.nextReminderTime = null;
  settings.pomodoroPhase = null;
  
  await saveSettings(settings);
  console.log('提醒已停止');
}

// ========== 通知功能 ==========

async function showNotification() {
  await checkAndResetDailyStats();
  
  await chrome.notifications.create('sedentaryAlert', {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: '🧘 久坐提醒',
    message: '该起来走走了！久坐伤身，活动一下吧 💪',
    buttons: [
      { title: '✓ 已完成活动' }
    ],
    priority: 2,
    requireInteraction: true
  });
  
  await playNotificationSound('notification');
}

async function showPomodoroNotification(phase) {
  const title = phase === 'work' ? '🍅 番茄钟 - 开始工作' : '☕ 番茄钟 - 休息时间';
  const message = phase === 'work' 
    ? '休息结束！开始专注工作 25 分钟吧 💪'
    : '工作辛苦啦！休息 5 分钟，活动一下吧 🧘';
  
  await chrome.notifications.create('pomodoroAlert', {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message,
    buttons: phase === 'break' ? [{ title: '✓ 已完成活动' }] : [],
    priority: 2,
    requireInteraction: phase === 'break'
  });
}

// ========== 闹钟监听 ==========

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const settings = await getSettings();
  
  if (alarm.name === ALARM_NAME) {
    console.log('时间到了！显示提醒通知');
    
    // 更新活动统计
    const stats = await checkAndResetDailyStats();
    stats.activityCount++;
    await saveStats(stats);
    
    showNotification();
    updateNextReminderTime(settings);
  } else if (alarm.name === POMODORO_WORK_ALARM || alarm.name === POMODORO_BREAK_ALARM) {
    console.log('番茄钟阶段切换');
    switchPomodoroPhase();
  }
});

// ========== 通知交互 ==========

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    await chrome.notifications.clear(notificationId);
    console.log('用户完成活动');
  }
});

// ========== 辅助函数 ==========

async function updateNextReminderTime(settings) {
  if (settings.isRunning && settings.mode === 'normal') {
    settings.nextReminderTime = Date.now() + settings.intervalMinutes * 60 * 1000;
    await saveSettings(settings);
  }
}

async function getRemainingTime() {
  // 获取所有闹钟
  const alarms = await chrome.alarms.getAll();
  const now = Date.now();
  
  for (const alarm of alarms) {
    if ([ALARM_NAME, POMODORO_WORK_ALARM, POMODORO_BREAK_ALARM].includes(alarm.name)) {
      return alarm.scheduledTime - now;
    }
  }
  return 0;
}

async function getSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || DEFAULT_SETTINGS;
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

async function getStats() {
  const result = await chrome.storage.local.get(STATS_KEY);
  return result[STATS_KEY] || DEFAULT_STATS;
}

async function saveStats(stats) {
  await chrome.storage.local.set({ [STATS_KEY]: stats });
}

// ========== 消息处理 ==========

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'start':
          await startNormalReminder(request.minutes || 60);
          sendResponse({ success: true });
          break;
          
        case 'startPomodoro':
          await startPomodoroMode();
          sendResponse({ success: true });
          break;
          
        case 'stop':
          await stopReminder();
          sendResponse({ success: true });
          break;
          
        case 'getStatus':
          const remaining = await getRemainingTime();
          const settings = await getSettings();
          const stats = await checkAndResetDailyStats();
          sendResponse({
            isRunning: settings.isRunning,
            mode: settings.mode,
            intervalMinutes: settings.intervalMinutes,
            pomodoroPhase: settings.pomodoroPhase,
            remainingTime: remaining,
            soundEnabled: settings.soundEnabled,
            stats: stats
          });
          break;
          
        case 'getRemainingTime':
          const time = await getRemainingTime();
          sendResponse({ remainingTime: time });
          break;
          
        case 'toggleSound':
          const s = await getSettings();
          s.soundEnabled = !s.soundEnabled;
          await saveSettings(s);
          sendResponse({ soundEnabled: s.soundEnabled });
          break;
          
        case 'getStats':
          const st = await checkAndResetDailyStats();
          sendResponse({ stats: st });
          break;
          
        case 'playSound':
          // 由 offscreen.html 处理
          break;
          
        default:
          sendResponse({ error: '未知操作' });
      }
    } catch (error) {
      console.error('Background error:', error);
      sendResponse({ error: error.message });
    }
  })();
  
  return true;
});

console.log('久坐提醒助手 v2.0 Background Service Worker 已启动');
