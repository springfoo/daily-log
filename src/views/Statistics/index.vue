<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>📊 统计分析</h2>
      <div class="date-range">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="loadData"
        />
        <el-radio-group v-model="quickRange" size="small" @change="onQuickRange">
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="month">本月</el-radio-button>
          <el-radio-button value="quarter">近三月</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.totalDays }}</div>
          <div class="stat-label">记录天数</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.avgSleep }}</div>
          <div class="stat-label">平均睡眠</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.dreamRate }}%</div>
          <div class="stat-label">做梦频率</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ stats.knowledgeDays }}</div>
          <div class="stat-label">学到新知识</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 睡眠趋势 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>🛏️ 睡眠趋势</template>
      <div ref="sleepChartRef" class="chart-container"></div>
    </el-card>

    <!-- 时间分配 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>💼 活动时间分配</template>
          <div ref="activityPieRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>📈 每日时间利用</template>
          <div ref="dailyBarRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 习惯追踪 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>🔥 记录连续性</template>
      <div ref="heatmapRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useDiaryStore } from '@/stores/diary'
import { useSettingsStore } from '@/stores/settings'
import type { DiaryEntry } from '@/types/diary'

const diaryStore = useDiaryStore()
const settingsStore = useSettingsStore()

const dateRange = ref<[string, string]>(['', ''])
const quickRange = ref('month')
const diaries = ref<DiaryEntry[]>([])

const sleepChartRef = ref<HTMLElement>()
const activityPieRef = ref<HTMLElement>()
const dailyBarRef = ref<HTMLElement>()
const heatmapRef = ref<HTMLElement>()

let sleepChart: echarts.ECharts
let activityPie: echarts.ECharts
let dailyBar: echarts.ECharts
let heatmapChart: echarts.ECharts

const stats = reactive({
  totalDays: 0,
  avgSleep: '0h',
  dreamRate: 0,
  knowledgeDays: 0,
})

function getDateRange(type: string): [string, string] {
  const now = new Date()
  const end = now.toISOString().slice(0, 10)
  let start: string
  if (type === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay() + 1)
    start = d.toISOString().slice(0, 10)
  } else if (type === 'month') {
    start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  } else {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 3)
    start = d.toISOString().slice(0, 10)
  }
  return [start, end]
}

function onQuickRange(val: string | number | boolean | undefined) {
  dateRange.value = getDateRange(val as string)
  loadData()
}

function calcSleepMinutes(diary: DiaryEntry): number {
  const [bh, bm] = diary.sleep.bedTime.split(':').map(Number)
  const [wh, wm] = diary.sleep.wakeTime.split(':').map(Number)
  let minutes = (wh * 60 + wm) - (bh * 60 + bm)
  if (minutes < 0) minutes += 24 * 60
  return minutes
}

function computeStats() {
  const data = diaries.value
  stats.totalDays = data.length

  if (data.length === 0) {
    stats.avgSleep = '0h'
    stats.dreamRate = 0
    stats.knowledgeDays = 0
    return
  }

  // 平均睡眠
  const totalSleep = data.reduce((sum, d) => sum + calcSleepMinutes(d), 0)
  const avgMin = Math.round(totalSleep / data.length)
  const h = Math.floor(avgMin / 60)
  const m = avgMin % 60
  stats.avgSleep = `${h}h${m > 0 ? m + 'm' : ''}`

  // 做梦频率
  const dreamCount = data.filter((d) => d.dream.hasDream).length
  stats.dreamRate = Math.round((dreamCount / data.length) * 100)

  // 学到新知识天数
  stats.knowledgeDays = data.filter((d) => d.knowledge.hasNew).length
}

function renderSleepChart() {
  if (!sleepChartRef.value) return
  if (!sleepChart) sleepChart = echarts.init(sleepChartRef.value)

  const data = diaries.value.sort((a, b) => a.date.localeCompare(b.date))
  const dates = data.map((d) => d.date.slice(5))
  const sleepHours = data.map((d) => +(calcSleepMinutes(d) / 60).toFixed(1))

  sleepChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '小时', min: 0, max: 12 },
    series: [
      {
        name: '睡眠时长',
        type: 'line',
        data: sleepHours,
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#409EFF' },
        markLine: {
          data: [{ type: 'average', name: '平均' }],
        },
      },
    ],
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
  })
}

function renderActivityPie() {
  if (!activityPieRef.value) return
  if (!activityPie) activityPie = echarts.init(activityPieRef.value)

  const typeMinutes: Record<string, number> = {}
  const slotMin = settingsStore.settings.timeGrid.slotMinutes

  for (const diary of diaries.value) {
    for (const slot of diary.workStudy.timeSlots) {
      if (slot.activityType) {
        typeMinutes[slot.activityType] = (typeMinutes[slot.activityType] || 0) + slotMin
      }
    }
  }

  const pieData = Object.entries(typeMinutes).map(([type, minutes]) => {
    const config = settingsStore.getActivityConfig(type as never)
    return {
      name: config.label,
      value: Math.round(minutes / 60 * 10) / 10,
      itemStyle: { color: settingsStore.getActivityColor(type as never) },
    }
  })

  activityPie.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}小时 ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: pieData,
        label: { formatter: '{b}\n{d}%' },
      },
    ],
  })
}

function renderDailyBar() {
  if (!dailyBarRef.value) return
  if (!dailyBar) dailyBar = echarts.init(dailyBarRef.value)

  const data = diaries.value.sort((a, b) => a.date.localeCompare(b.date))
  const dates = data.map((d) => d.date.slice(5))
  const slotMin = settingsStore.settings.timeGrid.slotMinutes
  const hours = data.map((d) => {
    const active = d.workStudy.timeSlots.filter((s) => s.activityType).length
    return +(active * slotMin / 60).toFixed(1)
  })

  dailyBar.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value', name: '小时' },
    series: [
      {
        name: '安排时间',
        type: 'bar',
        data: hours,
        itemStyle: { color: '#67C23A', borderRadius: [4, 4, 0, 0] },
      },
    ],
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
  })
}

function renderHeatmap() {
  if (!heatmapRef.value) return
  if (!heatmapChart) heatmapChart = echarts.init(heatmapRef.value)

  const recordSet = new Set(diaries.value.map((d) => d.date))

  // 生成最近90天数据
  const data: Array<[string, number]> = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    data.push([dateStr, recordSet.has(dateStr) ? 1 : 0])
  }

  heatmapChart.setOption({
    tooltip: {
      formatter: (params: { value: [string, number] }) => {
        return `${params.value[0]}: ${params.value[1] ? '✅ 已记录' : '⬜ 未记录'}`
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      inRange: { color: ['#ebedf0', '#409EFF'] },
    },
    calendar: {
      top: 30,
      left: 60,
      right: 20,
      cellSize: [16, 16],
      range: [data[0][0], data[data.length - 1][0]],
      itemStyle: { borderWidth: 2, borderColor: '#fff' },
      yearLabel: { show: false },
      dayLabel: { nameMap: 'ZH' },
      monthLabel: { nameMap: 'ZH' },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data,
      },
    ],
  })
}

async function loadData() {
  if (!dateRange.value[0] || !dateRange.value[1]) return
  diaries.value = await diaryStore.getDiariesInRange(dateRange.value[0], dateRange.value[1])
  computeStats()
  await nextTick()
  renderSleepChart()
  renderActivityPie()
  renderDailyBar()
  renderHeatmap()
}

function handleResize() {
  sleepChart?.resize()
  activityPie?.resize()
  dailyBar?.resize()
  heatmapChart?.resize()
}

onMounted(async () => {
  dateRange.value = getDateRange('month')
  await diaryStore.loadRecordedDates()
  await loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  sleepChart?.dispose()
  activityPie?.dispose()
  dailyBar?.dispose()
  heatmapChart?.dispose()
})
</script>

<style scoped>
.statistics-page {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-cards {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #409EFF;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.chart-card {
  margin-bottom: 16px;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
