<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">🍽️ 饮食记录</span>
      </div>
    </template>

    <el-form label-width="60px" size="default">
      <el-form-item label="早餐">
        <el-input
          v-model="data.breakfast"
          placeholder="今天早餐吃了什么..."
          clearable
        />
      </el-form-item>
      <el-form-item label="午餐">
        <el-input
          v-model="data.lunch"
          placeholder="今天午餐吃了什么..."
          clearable
        />
      </el-form-item>
      <el-form-item label="晚餐">
        <el-input
          v-model="data.dinner"
          placeholder="今天晚餐吃了什么..."
          clearable
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { MealRecord } from '@/types/diary'
const data = defineModel<MealRecord>({ required: true })
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
