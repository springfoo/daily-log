<template>
  <div class="daily-log-wrapper">
    <div class="daily-log-toolbar">
      <div class="activity-selector">
        <span class="toolbar-label">选择活动类型：</span>
        <el-radio-group v-model="selectedActivity" size="small">
          <el-radio-button
            v-for="act in settingsStore.activityTypes"
            :key="act.type"
            :value="act.type"
          >
            <span
              class="activity-dot"
              :style="{ backgroundColor: settingsStore.getActivityColor(act.type) }"
            ></span>
            {{ act.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="toolbar-actions">
        <el-button size="small" @click="clearAll" :icon="Delete">清除全部</el-button>
      </div>
    </div>

    <div class="daily-log-hint">
      <el-icon><InfoFilled /></el-icon>
      提示：按住鼠标拖动可批量选择时间方格
    </div>

    <div
      class="daily-log"
      @mousedown.prevent="onMouseDown"
      @mousemove.prevent="onMouseMove"
      @mouseup.prevent="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <div
        v-for="slot in slots"
        :key="slot.index"
        class="time-slot"
        :class="{
          'is-active': !!slot.activityType,
          'is-selecting': isInSelection(slot.index),
          'is-hour-start': slot.startTime.endsWith(':00'),
        }"
        :style="getSlotStyle(slot)"
        :data-index="slot.index"
        :title="getSlotTooltip(slot)"
      >
        <span v-if="slot.startTime.endsWith(':00')" class="time-label">
          {{ slot.startTime }}
        </span>
      </div>
    </div>

    <!-- 活动描述弹窗 -->
    <el-dialog
      v-model="showDescDialog"
      title="添加活动描述"
      width="400px"
      @close="onDescDialogClose"
    >
      <div class="desc-dialog-info">
        <el-tag
          :color="settingsStore.getActivityColor(selectedActivity)"
          effect="dark"
          size="small"
        >
          {{ settingsStore.getActivityConfig(selectedActivity).label }}
        </el-tag>
        <span class="desc-time-range">
          {{ selectionTimeRange }}
        </span>
      </div>
      <el-input
        v-model="tempDescription"
        type="textarea"
        :rows="3"
        placeholder="描述一下这段时间做了什么..."
      />
      <template #footer>
        <el-button @click="showDescDialog = false">跳过</el-button>
        <el-button type="primary" @click="confirmDescription">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Delete, InfoFilled } from '@element-plus/icons-vue'
import { useSettingsStore } from '@/stores/settings'
import type { ActivityType, TimeSlot } from '@/types/diary'

const props = defineProps<{
  modelValue: TimeSlot[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TimeSlot[]]
}>()

const settingsStore = useSettingsStore()

const selectedActivity = ref<ActivityType>('work')
const isDragging = ref(false)
const dragStart = ref(-1)
const dragEnd = ref(-1)
const showDescDialog = ref(false)
const tempDescription = ref('')
const pendingSlotIndices = ref<number[]>([])

/** 根据设置生成所有时间方格 */
const slots = computed<TimeSlot[]>(() => {
  const total = settingsStore.getTotalSlots()
  const result: TimeSlot[] = []
  for (let i = 0; i < total; i++) {
    const existing = props.modelValue.find((s) => s.index === i)
    result.push({
      index: i,
      startTime: settingsStore.getTimeByIndex(i),
      activityType: existing?.activityType,
      description: existing?.description,
    })
  }
  return result
})

const selectionTimeRange = computed(() => {
  if (pendingSlotIndices.value.length === 0) return ''
  const sorted = [...pendingSlotIndices.value].sort((a, b) => a - b)
  const start = settingsStore.getTimeByIndex(sorted[0])
  const end = settingsStore.getTimeByIndex(sorted[sorted.length - 1] + 1)
  return `${start} - ${end}`
})

function getSlotStyle(slot: TimeSlot) {
  if (slot.activityType) {
    return {
      backgroundColor: settingsStore.getActivityColor(slot.activityType),
    }
  }
  return {}
}

function getSlotTooltip(slot: TimeSlot) {
  const time = slot.startTime
  if (slot.activityType) {
    const config = settingsStore.getActivityConfig(slot.activityType)
    return `${time} - ${config.label}${slot.description ? ': ' + slot.description : ''}`
  }
  return time
}

function isInSelection(index: number): boolean {
  if (!isDragging.value) return false
  const start = Math.min(dragStart.value, dragEnd.value)
  const end = Math.max(dragStart.value, dragEnd.value)
  return index >= start && index <= end
}

function getIndexFromEvent(e: MouseEvent): number {
  const target = (e.target as HTMLElement).closest('.time-slot') as HTMLElement | null
  if (!target) return -1
  return parseInt(target.dataset.index || '-1')
}

function onMouseDown(e: MouseEvent) {
  const index = getIndexFromEvent(e)
  if (index < 0) return
  isDragging.value = true
  dragStart.value = index
  dragEnd.value = index
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const index = getIndexFromEvent(e)
  if (index >= 0) {
    dragEnd.value = index
  }
}

function onMouseUp() {
  if (!isDragging.value) return
  isDragging.value = false

  const start = Math.min(dragStart.value, dragEnd.value)
  const end = Math.max(dragStart.value, dragEnd.value)
  const indices = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  // 检查是否需要清除（点击已有颜色的格子）
  if (indices.length === 1) {
    const existing = props.modelValue.find((s) => s.index === indices[0])
    if (existing?.activityType) {
      // 清除这个格子
      const newSlots = props.modelValue.filter((s) => s.index !== indices[0])
      emit('update:modelValue', newSlots)
      return
    }
  }

  pendingSlotIndices.value = indices
  tempDescription.value = ''
  showDescDialog.value = true
}

function confirmDescription() {
  applySelection(tempDescription.value)
  showDescDialog.value = false
}

function onDescDialogClose() {
  applySelection('')
}

function applySelection(description: string) {
  const newSlots = [...props.modelValue]

  for (const index of pendingSlotIndices.value) {
    const existingIdx = newSlots.findIndex((s) => s.index === index)
    const slotData: TimeSlot = {
      index,
      startTime: settingsStore.getTimeByIndex(index),
      activityType: selectedActivity.value,
      description: description || undefined,
    }
    if (existingIdx >= 0) {
      newSlots[existingIdx] = slotData
    } else {
      newSlots.push(slotData)
    }
  }

  emit('update:modelValue', newSlots)
  pendingSlotIndices.value = []
}

function clearAll() {
  emit('update:modelValue', [])
}

// 初始化
watch(
  () => settingsStore.settings.timeGrid,
  () => {
    // 设置改变时重新计算
  },
  { deep: true }
)
</script>

<style scoped>
.daily-log-wrapper {
  width: 100%;
}

.daily-log-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  color: #606266;
  margin-right: 8px;
}

.activity-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.daily-log-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.daily-log {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  user-select: none;
  cursor: pointer;
}

.time-slot {
  width: 68px;
  height: 32px;
  background: #f0f2f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  position: relative;
  font-size: 11px;
}

.time-slot:hover {
  outline: 2px solid #409EFF;
  z-index: 1;
}

.time-slot.is-active {
  color: #fff;
  font-weight: 500;
}

.time-slot.is-selecting {
  outline: 2px solid #409EFF;
  opacity: 0.75;
  z-index: 1;
}

.time-slot.is-hour-start {
  border-left: 2px solid #dcdfe6;
}

.time-label {
  font-size: 10px;
  pointer-events: none;
}

.time-slot.is-active .time-label {
  color: rgba(255, 255, 255, 0.9);
}

.desc-dialog-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.desc-time-range {
  font-size: 14px;
  color: #606266;
}
</style>
