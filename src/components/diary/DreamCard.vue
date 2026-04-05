<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">💭 做梦记录</span>
      </div>
    </template>

    <el-form label-width="90px" size="default">
      <el-form-item label="是否做梦">
        <el-switch v-model="data.hasDream" />
      </el-form-item>
      <el-form-item v-if="data.hasDream" label="梦境内容">
        <el-input
          v-model="data.content"
          type="textarea"
          :rows="4"
          placeholder="描述一下你的梦境..."
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import type { DreamRecord } from '@/types/diary'
const data = defineModel<DreamRecord>({ required: true })
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
