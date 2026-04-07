<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">🍽️ 饮食记录</span>
        <el-button
          v-if="hasDefaults"
          size="small"
          type="primary"
          link
          @click="applyDefaults"
        >
          快速填充默认值
        </el-button>
      </div>
    </template>

    <el-form label-width="60px" size="default">
      <el-form-item label="早餐">
        <el-input
          v-model="data.breakfast"
          placeholder="今天早餐吃了什么..."
          clearable
        >
          <template v-if="settingsStore.settings.mealDefaults.breakfast" #append>
            <el-button @click="data.breakfast = settingsStore.settings.mealDefaults.breakfast">
              默认
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="午餐">
        <el-input
          v-model="data.lunch"
          placeholder="今天午餐吃了什么..."
          clearable
        >
          <template v-if="settingsStore.settings.mealDefaults.lunch" #append>
            <el-button @click="data.lunch = settingsStore.settings.mealDefaults.lunch">
              默认
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="晚餐">
        <el-input
          v-model="data.dinner"
          placeholder="今天晚餐吃了什么..."
          clearable
        >
          <template v-if="settingsStore.settings.mealDefaults.dinner" #append>
            <el-button @click="data.dinner = settingsStore.settings.mealDefaults.dinner">
              默认
            </el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import type { MealRecord } from '@/types/diary'

const data = defineModel<MealRecord>({ required: true })
const settingsStore = useSettingsStore()

const hasDefaults = computed(() => {
  const { breakfast, lunch, dinner } = settingsStore.settings.mealDefaults
  return !!(breakfast || lunch || dinner)
})

function applyDefaults() {
  const defaults = settingsStore.settings.mealDefaults
  if (defaults.breakfast) data.value.breakfast = defaults.breakfast
  if (defaults.lunch) data.value.lunch = defaults.lunch
  if (defaults.dinner) data.value.dinner = defaults.dinner
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
</style>
