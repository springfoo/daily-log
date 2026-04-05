<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">📋 明日重点事项</span>
        <el-tag size="small" type="info">{{ data.length }} 项</el-tag>
      </div>
    </template>

    <div v-for="(task, idx) in data" :key="task.id" class="task-item">
      <div class="task-row">
        <el-tag
          :type="priorityTag(task.priority)"
          size="small"
          class="priority-tag"
          @click="cyclePriority(idx)"
          style="cursor: pointer"
        >
          {{ priorityLabel(task.priority) }}
        </el-tag>
        <el-input
          v-model="task.content"
          placeholder="明天要做的事..."
          clearable
          class="task-input"
        />
        <el-button
          :icon="Delete"
          circle
          size="small"
          type="danger"
          @click="removeTask(idx)"
        />
      </div>
    </div>

    <el-button
      type="primary"
      text
      :icon="Plus"
      size="small"
      @click="addTask"
      style="margin-top: 8px"
    >
      添加事项
    </el-button>
  </el-card>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import type { TomorrowTask } from '@/types/diary'

const data = defineModel<TomorrowTask[]>({ required: true })

function addTask() {
  data.value.push({
    id: Date.now().toString(),
    content: '',
    priority: 'medium',
  })
}

function removeTask(index: number) {
  data.value.splice(index, 1)
}

function cyclePriority(index: number) {
  const order: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
  const current = order.indexOf(data.value[index].priority)
  data.value[index].priority = order[(current + 1) % 3]
}

function priorityTag(p: string): 'danger' | 'warning' | 'info' {
  if (p === 'high') return 'danger'
  if (p === 'medium') return 'warning'
  return 'info'
}

function priorityLabel(p: string): string {
  if (p === 'high') return '高'
  if (p === 'medium') return '中'
  return '低'
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
.task-item {
  margin-bottom: 8px;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.priority-tag {
  min-width: 32px;
  text-align: center;
}
.task-input {
  flex: 1;
}
</style>
