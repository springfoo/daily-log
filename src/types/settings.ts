/** 应用设置类型 */

export interface TimeGridSettings {
  /** 时间方格起始时间 HH:mm */
  startTime: string
  /** 时间方格结束时间 HH:mm */
  endTime: string
  /** 每格分钟数 */
  slotMinutes: number
}

export interface MealDefaults {
  /** 默认早餐 */
  breakfast: string
  /** 默认午餐 */
  lunch: string
  /** 默认晚餐 */
  dinner: string
}

export interface AppSettings {
  /** 时间方格设置 */
  timeGrid: TimeGridSettings
  /** 主题 */
  theme: 'light' | 'dark' | 'auto'
  /** 活动类型自定义配置 */
  activityColors: Record<string, string>
  /** 餐食默认值 */
  mealDefaults: MealDefaults
}

export const defaultSettings: AppSettings = {
  timeGrid: {
    startTime: '07:00',
    endTime: '24:00',
    slotMinutes: 10,
  },
  theme: 'light',
  activityColors: {
    work: '#409EFF',
    study: '#67C23A',
    exercise: '#E6A23C',
    leisure: '#909399',
    social: '#F56C6C',
    meal: '#b37feb',
    commute: '#5cdbd3',
    rest: '#d9d9d9',
    other: '#c0c4cc',
  },
  mealDefaults: {
    breakfast: '',
    lunch: '',
    dinner: '',
  },
}
