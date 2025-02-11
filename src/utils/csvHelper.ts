import { DailyStatistics } from '../types/statistics';

// 将对象数组转换为CSV字符串
export const convertToCSV = (data: DailyStatistics[]): string => {
  if (data.length === 0) return '';

  // 添加 UTF-8 BOM
  const BOM = '\uFEFF';

  // CSV 表头
  const headers = [
    '日期',
    '新增用户',
    '老用户',
    '活跃用户',
    '付费人数',
    '总充值金额',
    'ARPU',
    '付费ARPU',
    '活跃付费率',
    '新用户付费人数',
    '新用户付费金额',
    '新用户ARPU',
    '新用户付费率',
    '老用户付费人数',
    '老用户付费金额',
    '老用户ARPU',
    '老用户付费率'
  ];

  // 对象键名
  const keys: (keyof DailyStatistics)[] = [
    'date',
    'newUsers',
    'oldUsers',
    'activeUsers',
    'payingUsers',
    'totalRevenue',
    'arpu',
    'payingArpu',
    'activePayRate',
    'newUserPaying',
    'newUserRevenue',
    'newUserArpu',
    'newUserPayRate',
    'oldUserPaying',
    'oldUserRevenue',
    'oldUserArpu',
    'oldUserPayRate'
  ];

  // 生成CSV内容
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        // 处理数字格式
        if (typeof value === 'number') {
          if (key.includes('Rate')) {
            return value.toFixed(2) + '%';
          } else if (key.includes('Revenue') || key.includes('arpu') || key.includes('Arpu')) {
            return '¥' + value.toFixed(2);
          }
          return value.toString();
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return BOM + csvContent;
};

// 将CSV字符串转换为对象数组
export const parseCSV = (csv: string): DailyStatistics[] => {
  const lines = csv.split('\n');
  if (lines.length < 2) throw new Error('CSV格式错误');

  // 跳过表头，处理数据行
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',');
    if (values.length !== 17) throw new Error('CSV数据格式错误');

    // 处理数字格式
    const cleanNumber = (value: string) => {
      return parseFloat(value.replace(/[¥%]/g, ''));
    };

    return {
      date: values[0],
      newUsers: parseInt(values[1]),
      oldUsers: parseInt(values[2]),
      activeUsers: parseInt(values[3]),
      payingUsers: parseInt(values[4]),
      totalRevenue: cleanNumber(values[5]),
      arpu: cleanNumber(values[6]),
      payingArpu: cleanNumber(values[7]),
      activePayRate: cleanNumber(values[8]),
      newUserPaying: parseInt(values[9]),
      newUserRevenue: cleanNumber(values[10]),
      newUserArpu: cleanNumber(values[11]),
      newUserPayRate: cleanNumber(values[12]),
      oldUserPaying: parseInt(values[13]),
      oldUserRevenue: cleanNumber(values[14]),
      oldUserArpu: cleanNumber(values[15]),
      oldUserPayRate: cleanNumber(values[16])
    };
  });
}; 