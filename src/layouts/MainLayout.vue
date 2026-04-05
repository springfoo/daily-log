<template>
  <el-container class="app-layout">
    <el-aside :width="isCollapsed ? '64px' : '200px'" class="app-sidebar">
      <div class="sidebar-header">
        <div class="logo" v-show="!isCollapsed">
          <img class="logo-icon" src="../assets/logo.jpg" alt="Logo">
          <span class="logo-text">一日小记</span>
        </div>
        <div class="logo logo-collapsed" v-show="isCollapsed">
          <img class="logo-icon" src="../assets/logo.jpg" alt="Logo">
        </div>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :router="true"
        class="sidebar-menu"
      >
        <el-menu-item index="/diary">
          <el-icon><EditPen /></el-icon>
          <template #title>写日记</template>
        </el-menu-item>
        <el-menu-item index="/list">
          <el-icon><Calendar /></el-icon>
          <template #title>日记列表</template>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>统计分析</template>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>设置</template>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-button
          :icon="isCollapsed ? Expand : Fold"
          text
          @click="isCollapsed = !isCollapsed"
          class="collapse-btn"
        />
      </div>
    </el-aside>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  EditPen,
  Calendar,
  DataAnalysis,
  Setting,
  Expand,
  Fold,
} from '@element-plus/icons-vue'


const route = useRoute()
const isCollapsed = ref(false)

const activeMenu = computed(() => {
  if (route.path.startsWith('/diary')) return '/diary'
  return route.path
})
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width:64px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-footer {
  border-top: 1px solid #e4e7ed;
  padding: 8px;
  display: flex;
  justify-content: center;
}

.collapse-btn {
  width: 100%;
}

.app-main {
  background: #f5f7fa;
  overflow-y: auto;
  padding: 20px;
}
</style>
