/** 日记系统核心类型定义 */

/** 睡眠记录 */
export interface SleepRecord {
  /** 入睡时间 HH:mm */
  bedTime: string
  /** 起床时间 HH:mm */
  wakeTime: string
  /** 是否有夜醒 */
  hasWakeUp: boolean
  /** 夜醒记录 */
  wakeUps: Array<{
    /** 醒来时间 HH:mm */
    startTime: string
    /** 再次入睡时间 HH:mm */
    endTime: string
  }>
  /** 睡眠质量 1-5 */
  quality?: number
}

/** 梦境记录 */
export interface DreamRecord {
  /** 是否做梦 */
  hasDream: boolean
  /** 梦境内容 */
  content: string
}

/** 饮食记录 */
export interface MealRecord {
  /** 早餐 */
  breakfast: string
  /** 午餐 */
  lunch: string
  /** 晚餐 */
  dinner: string
}

/** 时间方格活动类型 */
export type ActivityType =
  | 'work'
  | 'study'
  | 'exercise'
  | 'leisure'
  | 'social'
  | 'meal'
  | 'commute'
  | 'rest'
  | 'other'

/** 活动类型配置 */
export interface ActivityConfig {
  type: ActivityType
  label: string
  color: string
  icon: string
}

/** 时间方格单个格子 */
export interface TimeSlot {
  /** 时间索引 (从0开始) */
  index: number
  /** 开始时间 HH:mm */
  startTime: string
  /** 活动类型 */
  activityType?: ActivityType
  /** 活动描述 */
  description?: string
}

/** 工作/学习时间段记录 */
export interface WorkStudyRecord {
  /** 时间方格数据 */
  timeSlots: TimeSlot[]
  /** 时间段汇总 */
  segments: Array<{
    startTime: string
    endTime: string
    activityType: ActivityType
    description: string
  }>
}

/** 新知识记录 */
export interface KnowledgeRecord {
  /** 是否有新知识 */
  hasNew: boolean
  /** 新知识列表 */
  items: string[]
}

/** 三件好事 */
export interface GoodThingsRecord {
  first: string
  second: string
  third: string
}

/** 明日重点事项 */
export interface TomorrowTask {
  id: string
  content: string
  priority: 'high' | 'medium' | 'low'
}

/** 完整的一天日记 */
export interface DiaryEntry {
  /** 主键ID (自增) */
  id?: number
  /** 日期 YYYY-MM-DD */
  date: string
  /** 睡眠记录 */
  sleep: SleepRecord
  /** 梦境记录 */
  dream: DreamRecord
  /** 饮食记录 */
  meal: MealRecord
  /** 工作/学习记录 */
  workStudy: WorkStudyRecord
  /** 新知识 */
  knowledge: KnowledgeRecord
  /** 三件好事 */
  goodThings: GoodThingsRecord
  /** 今日感悟 */
  reflection: string
  /** 明日重点事项 */
  tomorrowTasks: TomorrowTask[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 创建空白日记 */
export function createEmptyDiary(date: string): DiaryEntry {
  const now = new Date().toISOString()
  return {
    date,
    sleep: {
      bedTime: '23:00',
      wakeTime: '07:00',
      hasWakeUp: false,
      wakeUps: [],
    },
    dream: {
      hasDream: false,
      content: '',
    },
    meal: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    workStudy: {
      timeSlots: [],
      segments: [],
    },
    knowledge: {
      hasNew: false,
      items: [],
    },
    goodThings: {
      first: '',
      second: '',
      third: '',
    },
    reflection: '',
    tomorrowTasks: [],
    createdAt: now,
    updatedAt: now,
  }
}
