export interface DailyStatistics {
  date: string;  // 日期，格式：YYYY-MM-DD
  // 数据概览
  newUsers: number;
  oldUsers: number;
  activeUsers: number;
  payingUsers: number;
  totalRevenue: number;
  arpu: number;
  payingArpu: number;
  activePayRate: number;
  // 新用户分析
  newUserPaying: number;
  newUserRevenue: number;
  newUserArpu: number;
  newUserPayRate: number;
  // 老用户分析
  oldUserPaying: number;
  oldUserRevenue: number;
  oldUserArpu: number;
  oldUserPayRate: number;
  // 留存率数据
  [key: string]: number | string;
}

export type GameStatistics = DailyStatistics[];

export interface RetentionData {
  date: string;
  newUsers: number;
  [key: string]: number | string | '-';  // 允许值为数字、字符串或 '-'
} 