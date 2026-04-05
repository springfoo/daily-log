<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">✨ 三件好事</span>
      </div>
    </template>

    <el-form label-width="70px" size="default">
      <el-form-item label="第一件">
        <el-input
          v-model="data.first"
          type="textarea"
          :rows="2"
          placeholder="今天发生的第一件好事..."
        />
      </el-form-item>
      <el-form-item label="第二件">
        <el-input
          v-model="data.second"
          type="textarea"
          :rows="2"
          placeholder="今天发生的第二件好事..."
        />
      </el-form-item>
      <el-form-item label="第三件">
        <el-input
          v-model="data.third"
          type="textarea"
          :rows="2"
          placeholder="今天发生的第三件好事..."
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { GoodThingsRecord } from '@/types/diary'
const data = defineModel<GoodThingsRecord>({ required: true })
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
