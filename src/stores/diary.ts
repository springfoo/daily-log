import { defineStore } from 'pinia'
import { ref } from 'vue'
import { dataProvider } from '@/database'
import { createEmptyDiary, type DiaryEntry } from '@/types/diary'

export const useDiaryStore = defineStore('diary', () => {
  /** 当前编辑的日记 */
  const currentDiary = ref<DiaryEntry | null>(null)
  /** 当前日期 */
  const currentDate = ref(new Date().toISOString().slice(0, 10))
  /** 有记录的日期列表 */
  const recordedDates = ref<string[]>([])
  /** 加载状态 */
  const loading = ref(false)

  /** 加载指定日期的日记 */
  async function loadDiary(date: string) {
    loading.value = true
    currentDate.value = date
    try {
      const diary = await dataProvider.getDiary(date)
      currentDiary.value = diary || createEmptyDiary(date)
    } finally {
      loading.value = false
    }
  }

  /** 保存当前日记 */
  async function saveDiary() {
    if (!currentDiary.value) return
    loading.value = true
    try {
      const id = await dataProvider.saveDiary(currentDiary.value)
      currentDiary.value.id = id
      await loadRecordedDates()
    } finally {
      loading.value = false
    }
  }

  /** 删除指定日期日记 */
  async function deleteDiary(date: string) {
    loading.value = true
    try {
      await dataProvider.deleteDiary(date)
      if (currentDate.value === date) {
        currentDiary.value = createEmptyDiary(date)
      }
      await loadRecordedDates()
    } finally {
      loading.value = false
    }
  }

  /** 加载有记录的日期列表 */
  async function loadRecordedDates() {
    recordedDates.value = await dataProvider.getRecordedDates()
  }

  /** 获取日期范围内的日记 */
  async function getDiariesInRange(startDate: string, endDate: string) {
    return dataProvider.getDiariesInRange(startDate, endDate)
  }

  /** 导出所有数据 */
  async function exportData() {
    const data = await dataProvider.exportAll()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diary-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** 导入数据 */
  async function importData(file: File) {
    const text = await file.text()
    const entries = JSON.parse(text) as DiaryEntry[]
    await dataProvider.importAll(entries)
    await loadRecordedDates()
    await loadDiary(currentDate.value)
  }

  /** 清除所有数据 */
  async function clearAll() {
    await dataProvider.clearAll()
    recordedDates.value = []
    currentDiary.value = createEmptyDiary(currentDate.value)
  }

  return {
    currentDiary,
    currentDate,
    recordedDates,
    loading,
    loadDiary,
    saveDiary,
    deleteDiary,
    loadRecordedDates,
    getDiariesInRange,
    exportData,
    importData,
    clearAll,
  }
})
