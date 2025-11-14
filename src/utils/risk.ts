import type { RiskLevel } from '../server'

export function riskLevelToScore(level: RiskLevel | undefined): number {
  switch (level) {
    case 'NONE':
      return 0
    case 'LOW':
      return 0.25
    case 'MEDIUM':
      return 0.5
    case 'HIGH':
      return 0.75
    case 'CRISIS':
      return 1
    default:
      return 0.5
  }
}

export function tagStyle(level?: RiskLevel) {
  const score = riskLevelToScore(level)
  const hue = 120 - 120 * score
  return {
    backgroundColor: `hsla(${hue}, 85%, 96%, 1)`,
    color: `hsl(${hue}, 85%, 25%)`,
    borderColor: `hsl(${hue}, 85%, 55%)`,
  } as Record<string, string>
}

export function riskLevelCN(level?: RiskLevel) {
  switch (level) {
    case 'NONE':
      return '无风险'
    case 'LOW':
      return '低风险'
    case 'MEDIUM':
      return '中风险'
    case 'HIGH':
      return '高风险'
    case 'CRISIS':
      return '危机'
    default:
      return '未知'
  }
}

export function roleCN(role?: string) {
  switch ((role || '').toLowerCase()) {
    case 'user':
      return '用户'
    case 'assistant':
      return '助手'
    case 'system':
      return '系统'
    default:
      return role || ''
  }
}

export function intentCN(intent?: string) {
  switch (intent) {
    case 'HELP_SEEKING':
      return '寻求帮助'
    case 'VENTING':
      return '发泄/倾诉'
    case 'INFO_QUERY':
      return '信息查询'
    case 'NARRATIVE':
      return '叙述'
    case 'JOKE_SARCASM':
      return '玩笑/讽刺'
    case 'CRISIS_SELF_HARM':
      return '危机/自伤'
    case 'CLARIFICATION_REQUEST':
      return '澄清请求'
    case 'FOLLOW_UP_QUESTION':
      return '跟进问题'
    case 'OPINION':
      return '观点表达'
    case 'TOXIC_ABUSE':
      return '辱骂/有害'
    default:
      return '未知'
  }
}

export function targetCN(target?: string) {
  switch (target) {
    case 'SELF':
      return '自我'
    case 'OTHER_INDIVIDUAL':
      return '他人'
    case 'GROUP_ORG':
      return '群体/组织'
    default:
      return '未知'
  }
}

export function polarityCN(polarity?: string) {
  switch (polarity) {
    case 'POSITIVE': return '积极'
    case 'NEUTRAL': return '中性'
    case 'NEGATIVE': return '消极'
    case 'MIXED': return '混合'
    case 'UNKNOWN': return '未知'
    default: return polarity || '未知'
  }
}
