import { db } from './db'
import type { DataProvider } from './provider'
import type { DiaryEntry } from '@/types/diary'

/**
 * IndexedDB 数据提供者实现
 * 使用 Dexie.js 操作 IndexedDB
 */
export class IndexedDBProvider implements DataProvider {
  async getDiary(date: string): Promise<DiaryEntry | undefined> {
    return db.diaries.where('date').equals(date).first()
  }

  async saveDiary(entry: DiaryEntry): Promise<number> {
    // 深拷贝以移除 Vue 响应式代理，确保数据可以被 IndexedDB 存储
    const plainEntry = JSON.parse(JSON.stringify(entry))
    plainEntry.updatedAt = new Date().toISOString()
    
    const existing = await this.getDiary(plainEntry.date)
    if (existing) {
      plainEntry.id = existing.id
      await db.diaries.put(plainEntry)
      return existing.id!
    } else {
      plainEntry.createdAt = new Date().toISOString()
      return db.diaries.add(plainEntry) as unknown as number
    }
  }

  async deleteDiary(date: string): Promise<void> {
    await db.diaries.where('date').equals(date).delete()
  }

  async getDiariesInRange(startDate: string, endDate: string): Promise<DiaryEntry[]> {
    return db.diaries
      .where('date')
      .between(startDate, endDate, true, true)
      .sortBy('date')
  }

  async getRecordedDates(): Promise<string[]> {
    const all = await db.diaries.orderBy('date').toArray()
    return all.map((d) => d.date)
  }

  async exportAll(): Promise<DiaryEntry[]> {
    return db.diaries.orderBy('date').toArray()
  }

  async importAll(entries: DiaryEntry[]): Promise<void> {
    for (const entry of entries) {
      // 深拷贝以移除潜在的响应式代理
      const plainEntry = JSON.parse(JSON.stringify(entry))
      const existing = await this.getDiary(plainEntry.date)
      if (existing) {
        plainEntry.id = existing.id
        await db.diaries.put(plainEntry)
      } else {
        const { id: _id, ...rest } = plainEntry
        await db.diaries.add(rest as DiaryEntry)
      }
    }
  }

  async clearAll(): Promise<void> {
    await db.diaries.clear()
  }
}
