import Dexie, { type EntityTable } from 'dexie'
import type { DiaryEntry } from '@/types/diary'

/** 数据库定义 */
const db = new Dexie('DiaryDatabase') as Dexie & {
  diaries: EntityTable<DiaryEntry, 'id'>
}

db.version(1).stores({
  diaries: '++id, date',
})

export { db }
