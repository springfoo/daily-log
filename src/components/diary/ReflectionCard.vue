<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">💡 今日感悟</span>
      </div>
    </template>

    <el-input
      v-model="reflection"
      type="textarea"
      :rows="6"
      placeholder="今天有什么感悟和思考..."
      maxlength="5000"
      show-word-limit
    />
  </el-card>
</template>

<script setup lang="ts">
const reflection = defineModel<string>({ required: true })
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
