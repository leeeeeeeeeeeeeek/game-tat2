import React, { useState } from 'react';
import { Table, DatePicker, Space, Card, Button, Modal, InputNumber, Input } from 'antd';
import { FilterOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { DailyStatistics } from '../../types/statistics';
import ImportExport from './ImportExport';

const { RangePicker } = DatePicker;

interface RetentionProps {
  statistics: DailyStatistics[];
  onDataUpdate: (data: DailyStatistics[]) => void;
}

interface RetentionData {
  date: string;
  newUsers: number;
  [key: string]: number | string; // 动态留存率列
}

interface GenerateOptions {
  newUsersRange: [number, number];
  day2RetentionRange: [number, number];
}

const Retention: React.FC<RetentionProps> = ({ statistics, onDataUpdate }) => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [retentionDays, setRetentionDays] = useState<number[]>([2,3,4,5,6,7,10,15,20,25,30]);
  const [displayDays, setDisplayDays] = useState<number>(30);
  const [generateOptions, setGenerateOptions] = useState<GenerateOptions>({
    newUsersRange: [400, 1000],
    day2RetentionRange: [15, 20],
  });

  const columns: ColumnsType<RetentionData> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      width: 120,
      align: 'center',
      sorter: (a: RetentionData, b: RetentionData) => {
        if (a.date === '合计') return -1;
        if (b.date === '合计') return 1;
        return dayjs(b.date).unix() - dayjs(a.date).unix();
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: '新增用户',
      dataIndex: 'newUsers',
      key: 'newUsers',
      width: 100,
      align: 'center',
      sorter: (a: RetentionData, b: RetentionData) => {
        if (a.date === '合计') return -1;
        if (b.date === '合计') return 1;
        return a.newUsers - b.newUsers;
      },
    },
    ...retentionDays.map(day => ({
      title: `${day}日留存`,
      dataIndex: `day${day}`,
      key: `day${day}`,
      width: 100,
      align: 'center' as const,
      sorter: (a: RetentionData, b: RetentionData) => {
        if (a.date === '合计') return -1;
        if (b.date === '合计') return 1;
        const aValue = a[`day${day}`];
        const bValue = b[`day${day}`];
        if (aValue === '-' && bValue === '-') return 0;
        if (aValue === '-') return 1;
        if (bValue === '-') return -1;
        return Number(aValue) - Number(bValue);
      },
      render: (value: number | string) => {
        if (value === '-') return '-';
        return `${Number(value).toFixed(2)}%`;
      },
    })),
  ];

  const generateRetentionData = (): RetentionData[] => {
    // 计算合计数据
    const calculateTotal = () => {
      const totalNewUsers = statistics.reduce((sum, stat) => sum + stat.newUsers, 0);
      const total: RetentionData = {
        date: '合计',
        newUsers: totalNewUsers,
      };
      
      // 计算每个留存日的加权平均值
      retentionDays.forEach(day => {
        const dayKey = `day${day}`;
        const values = statistics
          .filter(stat => typeof (stat as any)[dayKey] === 'number')
          .map(stat => ({
            value: (stat as any)[dayKey] as number,
            weight: stat.newUsers
          }));
        
        if (values.length > 0) {
          const weightedSum = values.reduce((sum, { value, weight }) => sum + value * weight, 0);
          const totalWeight = values.reduce((sum, { weight }) => sum + weight, 0);
          total[dayKey] = weightedSum / totalWeight;
        } else {
          total[dayKey] = '-';
        }
      });
      
      return total;
    };

    // 直接使用 statistics 中的数据
    const data = statistics.map(stat => {
      const row: RetentionData = {
        date: stat.date,
        newUsers: stat.newUsers,
      };
      
      // 添加留存率数据
      retentionDays.forEach(day => {
        const dayKey = `day${day}`;
        row[dayKey] = (stat as any)[dayKey] ?? '-';
      });
      
      return row;
    });
    
    // 按日期倒序排序并限制显示天数
    const sortedData = data
      .slice(-displayDays)
      .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
    
    // 添加合计行
    return [calculateTotal(), ...sortedData];
  };

  const getExportData = (): RetentionData[] => {
    // 返回原始数据，使用类型断言
    return statistics.map(stat => ({
      date: stat.date,
      newUsers: stat.newUsers,
      ...Object.keys(stat)
        .filter(key => key.startsWith('day'))
        .reduce((acc, key) => ({
          ...acc,
          [key]: (stat as any)[key]
        }), {})
    }));
  };

  const generateMockData = () => {
    const { newUsersRange, day2RetentionRange } = generateOptions;
    const today = dayjs();
    const mockData: DailyStatistics[] = [];

    for (let i = 30; i >= 0; i--) {
      const date = today.subtract(i, 'day').format('YYYY-MM-DD');
      const newUsers = Math.floor(Math.random() * (newUsersRange[1] - newUsersRange[0])) + newUsersRange[0];
      const day2Base = (Math.random() * (day2RetentionRange[1] - day2RetentionRange[0])) + day2RetentionRange[0];

      const stats: any = {
        date,
        newUsers,
      };

      // 生成递减的留存率
      retentionDays.forEach((day, index) => {
        if (index === 0) {
          stats[`day${day}`] = day2Base;
        } else {
          const prevDay = retentionDays[index - 1];
          const prevRetention = stats[`day${prevDay}`];
          stats[`day${day}`] = (prevRetention * (0.8 + Math.random() * 0.1)).toFixed(2);
        }
      });

      mockData.push(stats);
    }

    onDataUpdate(mockData);
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <span>时间范围：</span>
              <RangePicker
                onChange={(dates) => {
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                }}
              />
            </Space>
            <Space>
              <Button 
                icon={<FilterOutlined />} 
                onClick={() => setIsFilterModalVisible(true)}
              >
                参数展示
              </Button>
              <ImportExport 
                onDataImported={onDataUpdate}
                currentData={getExportData()}
                type="retention"
              />
            </Space>
          </div>
          
          <Table
            columns={columns}
            dataSource={generateRetentionData()}
            rowKey="date"
            scroll={{ x: 1500 }}
            bordered
            size="middle"
            onChange={(pagination, filters, sorter) => {
              // 可以在这里添加排序变化的处理逻辑
            }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条数据`,
              defaultPageSize: 31,
              pageSizeOptions: ['31', '50', '100'],
            }}
            rowClassName={(record) => record.date === '合计' ? 'total-row' : ''}
            style={{ minHeight: 500 }}
          />
        </Space>
      </Card>

      <Modal
        title="参数设置"
        open={isFilterModalVisible}
        onOk={() => setIsFilterModalVisible(false)}
        onCancel={() => setIsFilterModalVisible(false)}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>新增用户范围：</div>
            <Space>
              <InputNumber
                value={generateOptions.newUsersRange[0]}
                onChange={(value) => setGenerateOptions(prev => ({
                  ...prev,
                  newUsersRange: [value || 400, prev.newUsersRange[1]]
                }))}
              />
              <span>-</span>
              <InputNumber
                value={generateOptions.newUsersRange[1]}
                onChange={(value) => setGenerateOptions(prev => ({
                  ...prev,
                  newUsersRange: [prev.newUsersRange[0], value || 1000]
                }))}
              />
            </Space>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>2日留存范围(%)：</div>
            <Space>
              <InputNumber
                value={generateOptions.day2RetentionRange[0]}
                onChange={(value) => setGenerateOptions(prev => ({
                  ...prev,
                  day2RetentionRange: [value || 15, prev.day2RetentionRange[1]]
                }))}
              />
              <span>-</span>
              <InputNumber
                value={generateOptions.day2RetentionRange[1]}
                onChange={(value) => setGenerateOptions(prev => ({
                  ...prev,
                  day2RetentionRange: [prev.day2RetentionRange[0], value || 20]
                }))}
              />
            </Space>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>留存天数（用逗号分隔）：</div>
            <Input
              value={retentionDays.join(',')}
              onChange={(e) => {
                const days = e.target.value
                  .split(',')
                  .map(d => parseInt(d.trim()))
                  .filter(d => !isNaN(d));
                setRetentionDays(days);
              }}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>展示天数：</div>
            <InputNumber
              style={{ width: '100%' }}
              value={displayDays}
              onChange={(value) => setDisplayDays(value || 30)}
              min={1}
              max={365}
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Retention; 