<template>
  <el-card shadow="hover" class="diary-card">
    <template #header>
      <div class="card-header">
        <span class="card-title">📚 新知识</span>
      </div>
    </template>

    <el-form size="default">
      <el-form-item>
        <el-switch v-model="data.hasNew" active-text="今天学到了新知识" />
      </el-form-item>
      <div v-if="data.hasNew">
        <div v-for="(item, idx) in data.items" :key="idx" class="knowledge-item">
          <el-input
            :model-value="item"
            @update:model-value="(v: string) => updateItem(idx, v)"
            placeholder="学到了什么新知识..."
            clearable
          >
            <template #prefix>
              <span class="item-num">{{ idx + 1 }}.</span>
            </template>
            <template #append>
              <el-button :icon="Delete" @click="removeItem(idx)" />
            </template>
          </el-input>
        </div>
        <el-button
          type="primary"
          text
          :icon="Plus"
          size="small"
          @click="addItem"
          style="margin-top: 8px"
        >
          添加新知识
        </el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import type { KnowledgeRecord } from '@/types/diary'

const data = defineModel<KnowledgeRecord>({ required: true })

function addItem() {
  data.value.items.push('')
}

function removeItem(index: number) {
  data.value.items.splice(index, 1)
}

function updateItem(index: number, value: string) {
  data.value.items[index] = value
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
.knowledge-item {
  margin-bottom: 8px;
}
.item-num {
  font-weight: 600;
  color: #409EFF;
}
</style>
