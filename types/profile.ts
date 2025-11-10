// client/lib/src/types/profile.ts

export interface UserProfile {
  userId: number;
  interests?: unknown; // 字符串或对象
  personalityTraits?: unknown;
  interactionPreferences?: unknown;
  emotionalTendency?: unknown;
  learningRecords?: unknown;
  // TODO: 其他字段视后端定义扩展
  [key: string]: unknown;
}
