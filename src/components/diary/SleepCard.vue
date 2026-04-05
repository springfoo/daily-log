<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">🛏️ 睡眠记录</span>
        <el-tag v-if="sleepDuration" size="small" type="info">{{ sleepDuration }}</el-tag>
      </div>
    </template>

    <el-form label-width="90px" size="default">
      <el-form-item label="入睡时间">
        <div class="time-with-shortcuts">
          <el-time-picker
            v-model="bedTimeDate"
            format="HH:mm"
            placeholder="选择入睡时间"
          />
          <div class="time-shortcuts">
            <el-button
              v-for="t in bedTimeShortcuts"
              :key="t"
              size="small"
              :type="data.bedTime === t ? 'primary' : 'default'"
              @click="data.bedTime = t"
            >
              {{ t }}
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="起床时间">
        <div class="time-with-shortcuts">
          <el-time-picker
            v-model="wakeTimeDate"
            format="HH:mm"
            placeholder="选择起床时间"
          />
          <div class="time-shortcuts">
            <el-button
              v-for="t in wakeTimeShortcuts"
              :key="t"
              size="small"
              :type="data.wakeTime === t ? 'primary' : 'default'"
              @click="data.wakeTime = t"
            >
              {{ t }}
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="睡眠质量">
        <el-rate v-model="data.quality" :max="5" show-text :texts="['很差', '较差', '一般', '较好', '很好']" />
      </el-form-item>
      <el-form-item label="夜间醒来">
        <el-switch v-model="data.hasWakeUp" />
      </el-form-item>
      <div v-if="data.hasWakeUp">
        <div
          v-for="(wakeUp, idx) in data.wakeUps"
          :key="idx"
          class="wake-up-item"
        >
          <el-form-item :label="`第${idx + 1}次醒来`">
            <div class="wake-up-row">
              <el-time-picker
                :model-value="parseTime(wakeUp.startTime)"
                @update:model-value="(v: Date | null) => { if (v) wakeUp.startTime = formatTime(v) }"
                format="HH:mm"
                placeholder="醒来时间"
                style="width: 45%"
              />
              <span class="time-sep">至</span>
              <el-time-picker
                :model-value="parseTime(wakeUp.endTime)"
                @update:model-value="(v: Date | null) => { if (v) wakeUp.endTime = formatTime(v) }"
                format="HH:mm"
                placeholder="再次入睡"
                style="width: 45%"
              />
              <el-button
                :icon="Delete"
                circle
                size="small"
                type="danger"
                @click="removeWakeUp(idx)"
              />
            </div>
          </el-form-item>
        </div>
        <el-button
          type="primary"
          text
          :icon="Plus"
          size="small"
          @click="addWakeUp"
        >
          添加醒来记录
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import type { SleepRecord } from '@/types/diary'

const data = defineModel<SleepRecord>({ required: true })

const bedTimeShortcuts = ['22:30', '23:00', '23:30', '00:00', '00:30']
const wakeTimeShortcuts = ['06:30', '07:00', '07:30', '08:00', '08:30']

function parseTime(timeStr: string): Date | undefined {
  if (!timeStr) return undefined
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const bedTimeDate = computed({
  get: () => parseTime(data.value.bedTime) || undefined,
  set: (v: Date | undefined) => {
    if (v) data.value.bedTime = formatTime(v)
  },
})

const wakeTimeDate = computed({
  get: () => parseTime(data.value.wakeTime) || undefined,
  set: (v: Date | undefined) => {
    if (v) data.value.wakeTime = formatTime(v)
  },
})

const sleepDuration = computed(() => {
  if (!data.value.bedTime || !data.value.wakeTime) return ''
  const [bh, bm] = data.value.bedTime.split(':').map(Number)
  const [wh, wm] = data.value.wakeTime.split(':').map(Number)
  let minutes = (wh * 60 + wm) - (bh * 60 + bm)
  if (minutes < 0) minutes += 24 * 60 // 跨夜
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
})

function addWakeUp() {
  data.value.wakeUps.push({ startTime: '', endTime: '' })
}

function removeWakeUp(index: number) {
  data.value.wakeUps.splice(index, 1)
}
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
.time-with-shortcuts {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.time-shortcuts {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.wake-up-item {
  margin-bottom: 4px;
}
.wake-up-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.time-sep {
  color: #909399;
  font-size: 13px;
}
</style>
