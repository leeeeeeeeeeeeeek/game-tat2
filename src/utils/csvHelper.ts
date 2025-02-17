import { DailyStatistics, RetentionData } from '../types/statistics';
import dayjs from 'dayjs';

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
          const keyStr = String(key);
          if (keyStr.includes('Rate')) {
            return value.toFixed(2) + '%';
          } else if (keyStr.includes('Revenue') || keyStr.includes('arpu') || keyStr.includes('Arpu')) {
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

// 将留存数据转换为CSV字符串
export const convertRetentionToCSV = (data: RetentionData[]): string => {
  if (data.length === 0) return '';

  // 添加 UTF-8 BOM
  const BOM = '\uFEFF';

  // 获取所有列名
  const columns = Object.keys(data[0]);

  // 生成CSV内容
  const csvContent = [
    columns.join(','),
    ...data.map(row => 
      columns.map(col => {
        const value = row[col];
        if (typeof value === 'number') {
          if (col.startsWith('day')) {
            return value.toFixed(2) + '%';
          }
          return value.toString();
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  return BOM + csvContent;
};

// 解析留存数据的CSV
export const parseRetentionCSV = (csv: string): RetentionData[] => {
  console.log('原始CSV数据:', csv);
  // 处理不同的换行符
  const lines = csv.trim().split(/\r\n|\n|\r/);
  console.log('分割后的行数:', lines.length);
  console.log('表头:', lines[0]);
  if (lines.length < 2) throw new Error('CSV格式错误');
  
  // 获取表头，并确保 day 列名格式正确
  const headers = lines[0].split(',').map(h => {
    const header = h.trim();
    // 保持原始列名
    return header;
  });
  console.log('处理后的表头:', headers);
  
  // 过滤掉空行和注释行
  const validLines = lines.slice(1)
    .filter(line => {
      const trimmed = line.trim();
      console.log('处理行:', trimmed);
      return trimmed && !trimmed.startsWith('#');
    });
  console.log('有效行数:', validLines.length);

  const parsedData = validLines
    .map(line => {
      // 清理每个值并分割
      const values = line.split(',').map(v => v.trim());
      console.log('处理值:', values);
      
      // 跳过无效行
      if (!values[0] || values.every(v => !v)) {
        return null;
      }
      
      // 确保日期格式正确
      if (!dayjs(values[0]).isValid() && values[0] !== '合计') {
        return null;
      }
      
      const row: RetentionData = {
        date: values[0],
        newUsers: parseInt(values[1]),
      };
      
      // 处理留存率数据
      for (let i = 2; i < values.length; i++) {
        const header = headers[i];
        const value = values[i].trim();
        // 处理空值和百分比
        if (!value || value === '-' || value === '') {
          row[header] = '-';
        } else {
          // 确保保留原始百分比值
          const numValue = parseFloat(value.replace('%', ''));
          if (!isNaN(numValue)) {
            row[header] = numValue;
          } else {
            row[header] = '-';
          }
        }
      }
      
      console.log('生成行:', row);
      return row;
    })
    .filter(Boolean) as RetentionData[];

  console.log('最终解析数据:', parsedData);
  return parsedData;
};

// 将留存数据转换为 DailyStatistics 格式
export const convertRetentionToDailyStats = (retentionData: RetentionData[]): DailyStatistics[] => {
  const result: DailyStatistics[] = [];
  
  // 移除可能存在的合计行，我们会在最后重新计算
  const dataWithoutTotal = retentionData.filter(row => {
    // 保留所有非合计且有效的行
    const isValid = row.date !== '合计' && !isNaN(row.newUsers);
    return isValid;
  });
  
  // 直接转换数据，不进行计算
  dataWithoutTotal.forEach(row => {
    // 直接使用原始数据
    const baseStats = { ...row };
    
    result.push(baseStats as unknown as DailyStatistics);
  });
  
  // 按日期倒序排序
  result.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  
  return result;
}; 