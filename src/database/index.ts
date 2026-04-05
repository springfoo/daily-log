import { IndexedDBProvider } from './indexeddb-provider'
import type { DataProvider } from './provider'

export type { DataProvider }

/** 全局数据提供者实例 */
export const dataProvider: DataProvider = new IndexedDBProvider()
