import type { DiaryEntry } from '@/types/diary'

/**
 * AI 服务提供者接口
 * 预留 AI 功能扩展接口
 */
export interface AIProvider {
  /** 名称 */
  name: string
  /** 生成日记总结 */
  generateSummary(diary: DiaryEntry): Promise<string>
  /** 情绪分析 */
  analyzeEmotion(diary: DiaryEntry): Promise<{
    emotion: string
    score: number
    suggestion: string
  }>
  /** 基于历史数据生成建议 */
  generateSuggestions(diaries: DiaryEntry[]): Promise<string[]>
  /** 扩展今日感悟 */
  expandReflection(reflection: string): Promise<string>
}

/**
 * AI 服务管理器
 */
export class AIManager {
  private provider: AIProvider | null = null

  setProvider(provider: AIProvider) {
    this.provider = provider
  }

  getProvider(): AIProvider | null {
    return this.provider
  }

  isAvailable(): boolean {
    return this.provider !== null
  }
}

export const aiManager = new AIManager()
