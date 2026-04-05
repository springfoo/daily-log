<template>
  <div class="diary-edit-page">
    <div class="page-header">
      <div class="header-left">
        <h2>📝 写日记</h2>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY年MM月DD日"
          value-format="YYYY-MM-DD"
          :clearable="false"
          size="large"
        />
        <el-tag type="info" size="large">
          {{ weekDay }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Check" @click="handleSave" :loading="diaryStore.loading">
          保存日记
        </el-button>
      </div>
    </div>

    <div class="diary-content" v-if="diaryStore.currentDiary" v-loading="diaryStore.loading">
      <!-- 1. 睡眠记录 -->
      <SleepCard v-model="diaryStore.currentDiary.sleep" />

      <!-- 2. 做梦记录 -->
      <DreamCard v-model="diaryStore.currentDiary.dream" />

      <!-- 3. 饮食记录 -->
      <MealCard v-model="diaryStore.currentDiary.meal" />

      <!-- 4. 工作/学习 - TimeGrid -->
      <WorkStudyCard v-model="diaryStore.currentDiary.workStudy" />

      <!-- 5. 新知识 -->
      <KnowledgeCard v-model="diaryStore.currentDiary.knowledge" />

      <!-- 6. 三件好事 -->
      <GoodThingsCard v-model="diaryStore.currentDiary.goodThings" />

      <!-- 7. 今日感悟 -->
      <ReflectionCard v-model="diaryStore.currentDiary.reflection" />

      <!-- 8. 明日重点事项 -->
      <TomorrowCard v-model="diaryStore.currentDiary.tomorrowTasks" />
    </div>

    <div class="page-footer">
      <el-button type="primary" :icon="Check" size="large" @click="handleSave" :loading="diaryStore.loading">
        保存日记
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDiaryStore } from '@/stores/diary'
import SleepCard from '@/components/diary/SleepCard.vue'
import DreamCard from '@/components/diary/DreamCard.vue'
import MealCard from '@/components/diary/MealCard.vue'
import WorkStudyCard from '@/components/diary/WorkStudyCard.vue'
import KnowledgeCard from '@/components/diary/KnowledgeCard.vue'
import GoodThingsCard from '@/components/diary/GoodThingsCard.vue'
import ReflectionCard from '@/components/diary/ReflectionCard.vue'
import TomorrowCard from '@/components/diary/TomorrowCard.vue'

const route = useRoute()
const router = useRouter()
const diaryStore = useDiaryStore()

const selectedDate = ref(
  (route.params.date as string) || new Date().toISOString().slice(0, 10)
)

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekDay = ref('')

function updateWeekDay() {
  const d = new Date(selectedDate.value)
  weekDay.value = weekDays[d.getDay()]
}

async function handleSave() {
  await diaryStore.saveDiary()
  ElMessage.success('日记保存成功！')
}

watch(selectedDate, async (newDate) => {
  updateWeekDay()
  await diaryStore.loadDiary(newDate)
  router.replace(`/diary/${newDate}`)
})

onMounted(async () => {
  updateWeekDay()
  await diaryStore.loadDiary(selectedDate.value)
  await diaryStore.loadRecordedDates()
})
</script>

<style scoped>
.diary-edit-page {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
}

.diary-content {
  display: flex;
  flex-direction: column;
}

.page-footer {
  text-align: center;
  padding: 20px 0;
}
</style>
