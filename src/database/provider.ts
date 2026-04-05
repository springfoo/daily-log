import type { DiaryEntry } from '@/types/diary'

/**
 * 数据提供者接口
 * 抽象数据访问层，便于未来切换后端存储
 */
export interface DataProvider {
  /** 获取指定日期的日记 */
  getDiary(date: string): Promise<DiaryEntry | undefined>
  /** 保存日记（新增或更新） */
  saveDiary(entry: DiaryEntry): Promise<number>
  /** 删除日记 */
  deleteDiary(date: string): Promise<void>
  /** 获取日期范围内的日记列表 */
  getDiariesInRange(startDate: string, endDate: string): Promise<DiaryEntry[]>
  /** 获取所有有记录的日期 */
  getRecordedDates(): Promise<string[]>
  /** 获取所有日记数据（用于导出） */
  exportAll(): Promise<DiaryEntry[]>
  /** 导入日记数据 */
  importAll(entries: DiaryEntry[]): Promise<void>
  /** 清除所有数据 */
  clearAll(): Promise<void>
}
