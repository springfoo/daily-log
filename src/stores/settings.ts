import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { defaultSettings, type AppSettings } from '@/types/settings'
import type { ActivityConfig, ActivityType } from '@/types/diary'

const SETTINGS_KEY = 'diary-app-settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(loadSettings())

  /** 预定义活动类型 */
  const activityTypes = ref<ActivityConfig[]>([
    { type: 'work', label: '工作', color: '#409EFF', icon: 'Briefcase' },
    { type: 'study', label: '学习', color: '#67C23A', icon: 'Reading' },
    { type: 'exercise', label: '运动', color: '#E6A23C', icon: 'Trophy' },
    { type: 'leisure', label: '休闲', color: '#909399', icon: 'Coffee' },
    { type: 'social', label: '社交', color: '#F56C6C', icon: 'ChatDotRound' },
    { type: 'meal', label: '用餐', color: '#b37feb', icon: 'Bowl' },
    { type: 'commute', label: '通勤', color: '#5cdbd3', icon: 'Van' },
    { type: 'rest', label: '休息', color: '#d9d9d9', icon: 'Moon' },
    { type: 'other', label: '其他', color: '#c0c4cc', icon: 'More' },
  ])

  function loadSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) }
      }
    } catch {
      // ignore
    }
    return { ...defaultSettings }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
  }

  function getActivityConfig(type: ActivityType): ActivityConfig {
    return activityTypes.value.find((a) => a.type === type) || activityTypes.value[activityTypes.value.length - 1]
  }

  function getActivityColor(type: ActivityType): string {
    return settings.value.activityColors[type] || getActivityConfig(type).color
  }

  /** 计算时间方格总数 */
  function getTotalSlots(): number {
    const { startTime, endTime, slotMinutes } = settings.value.timeGrid
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm)
    return Math.floor(totalMinutes / slotMinutes)
  }

  /** 根据索引获取时间文本 */
  function getTimeByIndex(index: number): string {
    const { startTime, slotMinutes } = settings.value.timeGrid
    const [sh, sm] = startTime.split(':').map(Number)
    const totalMinutes = sh * 60 + sm + index * slotMinutes
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  // 自动持久化
  watch(settings, saveSettings, { deep: true })

  return {
    settings,
    activityTypes,
    getActivityConfig,
    getActivityColor,
    getTotalSlots,
    getTimeByIndex,
    saveSettings,
  }
})
