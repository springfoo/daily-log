<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">💼 工作 / 学习</span>
        <el-tag v-if="summary" size="small" type="info">{{ summary }}</el-tag>
      </div>
    </template>

    <TimeGrid v-model="data.timeSlots" />

    <!-- 时间段汇总 -->
    <div v-if="segments.length > 0" class="segments-summary">
      <el-divider content-position="left">时间段汇总</el-divider>
      <div v-for="(seg, idx) in segments" :key="idx" class="segment-item">
        <el-tag
          :color="settingsStore.getActivityColor(seg.activityType)"
          effect="dark"
          size="small"
        >
          {{ settingsStore.getActivityConfig(seg.activityType).label }}
        </el-tag>
        <span class="segment-time">{{ seg.startTime }} - {{ seg.endTime }}</span>
        <span v-if="seg.description" class="segment-desc">{{ seg.description }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { TimeGrid } from '@/components/TimeGrid'
import { useSettingsStore } from '@/stores/settings'
import type { WorkStudyRecord, ActivityType } from '@/types/diary'

const data = defineModel<WorkStudyRecord>({ required: true })
const settingsStore = useSettingsStore()

/** 从时间方格自动生成连续时间段 */
const segments = computed(() => {
  const activeSlots = data.value.timeSlots
    .filter((s) => s.activityType)
    .sort((a, b) => a.index - b.index)

  if (activeSlots.length === 0) return []

  const result: Array<{
    startTime: string
    endTime: string
    activityType: ActivityType
    description: string
  }> = []

  let current = {
    startTime: activeSlots[0].startTime,
    endTime: settingsStore.getTimeByIndex(activeSlots[0].index + 1),
    activityType: activeSlots[0].activityType!,
    description: activeSlots[0].description || '',
  }

  for (let i = 1; i < activeSlots.length; i++) {
    const slot = activeSlots[i]
    if (
      slot.activityType === current.activityType &&
      slot.index === activeSlots[i - 1].index + 1
    ) {
      current.endTime = settingsStore.getTimeByIndex(slot.index + 1)
      if (slot.description && !current.description) {
        current.description = slot.description
      }
    } else {
      result.push({ ...current })
      current = {
        startTime: slot.startTime,
        endTime: settingsStore.getTimeByIndex(slot.index + 1),
        activityType: slot.activityType!,
        description: slot.description || '',
      }
    }
  }
  result.push({ ...current })
  return result
})

/** 时间利用率汇总 */
const summary = computed(() => {
  const active = data.value.timeSlots.filter((s) => s.activityType).length
  const total = settingsStore.getTotalSlots()
  if (active === 0) return ''
  const minutes = active * settingsStore.settings.timeGrid.slotMinutes
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `已安排 ${hours}h${mins > 0 ? mins + 'm' : ''} / ${Math.round((active / total) * 100)}%`
})

// 同步 segments 到 data
watch(segments, (val) => {
  data.value.segments = val
}, { deep: true })
</script>

<style scoped>
.diary-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
}
.segments-summary {
  margin-top: 12px;
}
.segment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
}
.segment-item:last-child {
  border-bottom: none;
}
.segment-time {
  font-size: 13px;
  color: #606266;
  font-family: monospace;
}
.segment-desc {
  font-size: 13px;
  color: #909399;
}
</style>
