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

const Retention: React.FC<RetentionProps> = ({ statistics, onDataUpdate }) => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [retentionDays, setRetentionDays] = useState<number[]>([2,3,4,5,6,7,10,15,20,25,30]);
  const [displayDays, setDisplayDays] = useState<number>(30);

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
    // 直接使用 statistics 中的数据
    const data = statistics.map(stat => {
      const row: RetentionData = {
        date: stat.date,
        newUsers: stat.newUsers,
      };
      
      // 添加留存率数据
      retentionDays.forEach(day => {
        const dayKey = `day${day}`;
        // 直接使用原始数据
        row[dayKey] = (stat as any)[dayKey] ?? '-';
      });
      
      return row;
    });
    
    // 按日期倒序排序并限制显示天数
    return data
      .slice(-displayDays)
      .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
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