<template>
  <div class="diary-list-page">
    <div class="page-header">
      <h2>📅 日记列表</h2>
      <div class="view-toggle">
        <el-radio-group v-model="viewMode" size="default">
          <el-radio-button value="calendar">日历视图</el-radio-button>
          <el-radio-button value="list">列表视图</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 日历视图 -->
    <div v-if="viewMode === 'calendar'" class="calendar-view">
      <el-calendar v-model="calendarDate">
        <template #date-cell="{ data }">
          <div
            class="calendar-cell"
            :class="{ 'has-record': isRecorded(data.day) }"
            @click="goToDiary(data.day)"
          >
            <span class="day-num">{{ data.day.split('-')[2] }}</span>
            <span v-if="isRecorded(data.day)" class="record-dot">●</span>
          </div>
        </template>
      </el-calendar>
    </div>

    <!-- 列表视图 -->
    <div v-else class="list-view">
      <el-empty v-if="diaryList.length === 0" description="还没有日记记录" />
      <div v-else>
        <el-card
          v-for="diary in diaryList"
          :key="diary.date"
          shadow="hover"
          class="diary-list-card"
          @click="goToDiary(diary.date)"
        >
          <div class="diary-list-item">
            <div class="diary-date-info">
              <div class="diary-date">{{ formatDate(diary.date) }}</div>
              <div class="diary-weekday">{{ getWeekDay(diary.date) }}</div>
            </div>
            <div class="diary-summary">
              <div class="summary-row" v-if="diary.sleep.bedTime">
                🛏️ {{ diary.sleep.bedTime }} - {{ diary.sleep.wakeTime }}
              </div>
              <div class="summary-row" v-if="getActiveActivities(diary)">
                💼 {{ getActiveActivities(diary) }}
              </div>
              <div class="summary-row" v-if="diary.reflection">
                💡 {{ diary.reflection.slice(0, 50) }}{{ diary.reflection.length > 50 ? '...' : '' }}
              </div>
              <div class="summary-row" v-if="diary.goodThings.first">
                ✨ {{ diary.goodThings.first.slice(0, 30) }}
              </div>
            </div>
            <el-icon class="go-icon"><ArrowRight /></el-icon>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { useDiaryStore } from '@/stores/diary'
import { useSettingsStore } from '@/stores/settings'
import type { DiaryEntry } from '@/types/diary'

const router = useRouter()
const diaryStore = useDiaryStore()
const settingsStore = useSettingsStore()

const viewMode = ref<'calendar' | 'list'>('calendar')
const calendarDate = ref(new Date())
const diaryList = ref<DiaryEntry[]>([])

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function isRecorded(day: string): boolean {
  return diaryStore.recordedDates.includes(day)
}

function goToDiary(date: string) {
  router.push(`/diary/${date}`)
}

function formatDate(date: string): string {
  return date.replace(/-/g, '.')
}

function getWeekDay(date: string): string {
  const d = new Date(date)
  return weekDays[d.getDay()]
}

function getActiveActivities(diary: DiaryEntry): string {
  const activeSlots = diary.workStudy.timeSlots.filter((s) => s.activityType)
  if (activeSlots.length === 0) return ''
  const minutes = activeSlots.length * settingsStore.settings.timeGrid.slotMinutes
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `已安排 ${hours}h${mins > 0 ? mins + 'm' : ''}`
}

async function loadList() {
  // 获取最近所有日记
  const all = await diaryStore.getDiariesInRange('2020-01-01', '2099-12-31')
  diaryList.value = all.reverse()
}

onMounted(async () => {
  await diaryStore.loadRecordedDates()
  await loadList()
})

watch(viewMode, async () => {
  if (viewMode.value === 'list') {
    await loadList()
  }
})
</script>

<style scoped>
.diary-list-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
}

.calendar-view :deep(.el-calendar-table td) {
  cursor: pointer;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.calendar-cell.has-record {
  background: #ecf5ff;
  border-radius: 4px;
}

.record-dot {
  color: #409EFF;
  font-size: 8px;
}

.diary-list-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.diary-list-card:hover {
  transform: translateX(4px);
}

.diary-list-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.diary-date-info {
  min-width: 100px;
  text-align: center;
}

.diary-date {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.diary-weekday {
  font-size: 12px;
  color: #909399;
}

.diary-summary {
  flex: 1;
}

.summary-row {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.go-icon {
  color: #c0c4cc;
  font-size: 18px;
}
</style>
