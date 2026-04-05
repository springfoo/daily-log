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
    entry.updatedAt = new Date().toISOString()
    const existing = await this.getDiary(entry.date)
    if (existing) {
      entry.id = existing.id
      await db.diaries.put(entry)
      return existing.id!
    } else {
      entry.createdAt = new Date().toISOString()
      return db.diaries.add(entry) as unknown as number
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
      const existing = await this.getDiary(entry.date)
      if (existing) {
        entry.id = existing.id
        await db.diaries.put(entry)
      } else {
        const { id: _id, ...rest } = entry
        await db.diaries.add(rest as DiaryEntry)
      }
    }
  }

  async clearAll(): Promise<void> {
    await db.diaries.clear()
  }
}
