// client/lib/src/types/admin.ts

// 精确枚举映射后端 dev.x.detector.* 枚举，不再允许额外字符串取值
export type RiskLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS' | 'UNKNOWN';
export type Polarity = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED' | 'UNKNOWN';
export type Intent = 'HELP_SEEKING' | 'VENTING' | 'INFO_QUERY' | 'NARRATIVE' | 'JOKE_SARCASM' | 'UNKNOWN';
export type Target = 'SELF' | 'OTHER_INDIVIDUAL' | 'GROUP_ORG' | 'UNKNOWN';

export interface AdminConversationMessage {
    id?: number;
    role?: string; // user|assistant|system|risk_detector
    messageType?: string; // text|risk_note|image|event
    text?: string | null;
    createdAt?: string; // ISO 时间
    [k: string]: unknown;
}

export interface AdminRiskMessageDetection {
    messageId?: number;
    riskLevel?: RiskLevel;
    polarity?: Polarity;
    intent?: Intent;
    target?: Target;
    confidence?: number;
    evidence?: string[];
    detectedAt?: string; // ISO 时间
    processed?: boolean; // 是否已处理
    processNotes?: string | null; // 处理备注
    [k: string]: unknown;
}

// 管理员处理风险检测结果请求体
export interface ProcessRiskDetectionPayload {
    processed: boolean;
    processNotes?: string | null;
}

export interface AdminRiskConversation {
    conversationId: number;
    userId: number;
    title?: string | null;
    createdAt?: string; // ISO 时间
    aggregatedRiskLevel?: RiskLevel;
    detections: AdminRiskMessageDetection[];
    messages: AdminConversationMessage[];
    [k: string]: unknown;
}
