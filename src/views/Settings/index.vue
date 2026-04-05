<template>
  <div class="settings-page">
    <h2>⚙️ 设置</h2>

    <!-- 时间方格设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>时间方格设置</template>
      <el-form label-width="120px" size="default">
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="startTimeDate"
            format="HH:mm"
            placeholder="选择开始时间"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="endTimeDate"
            format="HH:mm"
            placeholder="选择结束时间"
          />
        </el-form-item>
        <el-form-item label="每格分钟数">
          <el-select v-model="settingsStore.settings.timeGrid.slotMinutes">
            <el-option :value="5" label="5 分钟" />
            <el-option :value="10" label="10 分钟" />
            <el-option :value="15" label="15 分钟" />
            <el-option :value="30" label="30 分钟" />
          </el-select>
        </el-form-item>
        <el-form-item label="方格总数">
          <el-tag type="info">{{ settingsStore.getTotalSlots() }} 格</el-tag>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 活动类型颜色 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>活动类型颜色</template>
      <div class="color-grid">
        <div
          v-for="act in settingsStore.activityTypes"
          :key="act.type"
          class="color-item"
        >
          <span class="color-label">{{ act.label }}</span>
          <el-color-picker
            v-model="settingsStore.settings.activityColors[act.type]"
            size="small"
          />
        </div>
      </div>
    </el-card>

    <!-- 数据管理 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>数据管理</template>
      <el-form label-width="120px" size="default">
        <el-form-item label="导出数据">
          <el-button type="primary" :icon="Download" @click="handleExport">
            导出 JSON 文件
          </el-button>
          <span class="form-tip">将所有日记数据导出为 JSON 文件备份</span>
        </el-form-item>
        <el-form-item label="导入数据">
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".json"
            :on-change="handleImport"
          >
            <el-button type="success" :icon="Upload">导入 JSON 文件</el-button>
          </el-upload>
          <span class="form-tip">从备份文件恢复日记数据（相同日期会覆盖）</span>
        </el-form-item>
        <el-form-item label="存储信息">
          <el-descriptions :column="1" size="small" border>
            <el-descriptions-item label="记录天数">{{ recordCount }} 天</el-descriptions-item>
            <el-descriptions-item label="存储方式">IndexedDB (浏览器本地)</el-descriptions-item>
            <el-descriptions-item label="存储上限">理论上 GB 级别</el-descriptions-item>
          </el-descriptions>
        </el-form-item>
        <el-form-item label="危险操作">
          <el-popconfirm
            title="确定清除所有数据？此操作不可恢复！"
            confirm-button-text="确认清除"
            cancel-button-text="取消"
            @confirm="handleClearAll"
          >
            <template #reference>
              <el-button type="danger" :icon="Delete">清除所有数据</el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- AI 功能预留 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        🤖 AI 功能
        <el-tag size="small" type="warning" style="margin-left: 8px">即将推出</el-tag>
      </template>
      <el-empty description="AI 功能即将推出，敬请期待" :image-size="80" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useSettingsStore } from '@/stores/settings'
import { useDiaryStore } from '@/stores/diary'
import type { UploadFile } from 'element-plus'

const settingsStore = useSettingsStore()
const diaryStore = useDiaryStore()
const recordCount = ref(0)

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

const startTimeDate = computed({
  get: () => parseTime(settingsStore.settings.timeGrid.startTime),
  set: (v: Date | undefined) => {
    if (v) settingsStore.settings.timeGrid.startTime = formatTime(v)
  },
})

const endTimeDate = computed({
  get: () => parseTime(settingsStore.settings.timeGrid.endTime),
  set: (v: Date | undefined) => {
    if (v) settingsStore.settings.timeGrid.endTime = formatTime(v)
  },
})

async function handleExport() {
  await diaryStore.exportData()
  ElMessage.success('数据导出成功！')
}

async function handleImport(file: UploadFile) {
  if (!file.raw) return
  try {
    await diaryStore.importData(file.raw)
    recordCount.value = diaryStore.recordedDates.length
    ElMessage.success('数据导入成功！')
  } catch {
    ElMessage.error('导入失败，请检查文件格式')
  }
}

async function handleClearAll() {
  await diaryStore.clearAll()
  recordCount.value = 0
  ElMessage.success('数据已清除')
}

onMounted(async () => {
  await diaryStore.loadRecordedDates()
  recordCount.value = diaryStore.recordedDates.length
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-page h2 {
  font-size: 22px;
  margin-bottom: 20px;
}

.settings-card {
  margin-bottom: 16px;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-label {
  font-size: 14px;
  color: #606266;
}

.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
