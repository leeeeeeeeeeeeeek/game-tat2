import React, { useState } from 'react';
import { Table, DatePicker, Space, Card, Typography, Button, Modal, Checkbox } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DailyStatistics } from '../../types/statistics';
import dayjs from 'dayjs';
import ImportExport from './ImportExport';
import './Overview.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Group: CheckboxGroup } = Checkbox;

interface OverviewProps {
  statistics: DailyStatistics[];
  onDataUpdate: (data: DailyStatistics[]) => void;
}

const Overview: React.FC<OverviewProps> = ({ statistics, onDataUpdate }) => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['overview', 'newUser', 'oldUser']);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'newUsers', 'oldUsers', 'activeUsers', 'payingUsers', 'totalRevenue', 'arpu', 'payingArpu', 'activePayRate',
    'newUserPaying', 'newUserRevenue', 'newUserArpu', 'newUserPayRate',
    'oldUserPaying', 'oldUserRevenue', 'oldUserArpu', 'oldUserPayRate'
  ]);

  const groupConfig = {
    overview: {
      label: '数据概览',
      value: 'overview',
      columns: ['newUsers', 'oldUsers', 'activeUsers', 'payingUsers', 'totalRevenue', 'arpu', 'payingArpu', 'activePayRate']
    },
    newUser: {
      label: '新用户分析',
      value: 'newUser',
      columns: ['newUserPaying', 'newUserRevenue', 'newUserArpu', 'newUserPayRate']
    },
    oldUser: {
      label: '老用户分析',
      value: 'oldUser',
      columns: ['oldUserPaying', 'oldUserRevenue', 'oldUserArpu', 'oldUserPayRate']
    }
  };

  const columns: ColumnsType<DailyStatistics> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      width: 120,
      align: 'center',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend',
    },
    // 数据概览
    {
      title: '数据概览',
      align: 'center',
      children: [
        {
          title: '新增用户',
          dataIndex: 'newUsers',
          key: 'newUsers',
          width: 100,
          align: 'center',
        },
        {
          title: '老用户',
          dataIndex: 'oldUsers',
          key: 'oldUsers',
          width: 100,
          align: 'center',
        },
        {
          title: '活跃用户',
          dataIndex: 'activeUsers',
          key: 'activeUsers',
          width: 100,
          align: 'center',
        },
        {
          title: '付费人数',
          dataIndex: 'payingUsers',
          key: 'payingUsers',
          width: 100,
          align: 'center',
        },
        {
          title: '总充值金额',
          dataIndex: 'totalRevenue',
          key: 'totalRevenue',
          width: 120,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: 'ARPU',
          dataIndex: 'arpu',
          key: 'arpu',
          width: 100,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: '付费ARPU',
          dataIndex: 'payingArpu',
          key: 'payingArpu',
          width: 100,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: '付费率',
          dataIndex: 'activePayRate',
          key: 'activePayRate',
          width: 100,
          align: 'center',
          render: (value: number) => `${value.toFixed(2)}%`,
        },
      ],
    },
    // 新用户分析
    {
      title: '新用户分析',
      align: 'center',
      children: [
        {
          title: '付费人数',
          dataIndex: 'newUserPaying',
          key: 'newUserPaying',
          width: 100,
          align: 'center',
        },
        {
          title: '付费金额',
          dataIndex: 'newUserRevenue',
          key: 'newUserRevenue',
          width: 120,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: 'ARPU',
          dataIndex: 'newUserArpu',
          key: 'newUserArpu',
          width: 100,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: '付费率',
          dataIndex: 'newUserPayRate',
          key: 'newUserPayRate',
          width: 100,
          align: 'center',
          render: (value: number) => `${value.toFixed(2)}%`,
        },
      ],
    },
    // 老用户分析
    {
      title: '老用户分析',
      align: 'center',
      children: [
        {
          title: '付费人数',
          dataIndex: 'oldUserPaying',
          key: 'oldUserPaying',
          width: 100,
          align: 'center',
        },
        {
          title: '付费金额',
          dataIndex: 'oldUserRevenue',
          key: 'oldUserRevenue',
          width: 120,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: 'ARPU',
          dataIndex: 'oldUserArpu',
          key: 'oldUserArpu',
          width: 100,
          align: 'center',
          render: (value: number) => `¥${value.toFixed(2)}`,
        },
        {
          title: '付费率',
          dataIndex: 'oldUserPayRate',
          key: 'oldUserPayRate',
          width: 100,
          align: 'center',
          render: (value: number) => `${value.toFixed(2)}%`,
        },
      ],
    },
  ];

  // 所有可选列的配置
  const columnOptions = [
    {
      label: '数据概览',
      value: 'overview',
      children: [
        { label: '新增用户', value: 'newUsers' },
        { label: '老用户', value: 'oldUsers' },
        { label: '活跃用户', value: 'activeUsers' },
        { label: '付费人数', value: 'payingUsers' },
        { label: '总充值金额', value: 'totalRevenue' },
        { label: 'ARPU', value: 'arpu' },
        { label: '付费ARPU', value: 'payingArpu' },
        { label: '付费率', value: 'activePayRate' },
      ]
    },
    {
      label: '新用户分析',
      value: 'newUser',
      children: [
        { label: '付费人数', value: 'newUserPaying' },
        { label: '付费金额', value: 'newUserRevenue' },
        { label: 'ARPU', value: 'newUserArpu' },
        { label: '付费率', value: 'newUserPayRate' },
      ]
    },
    {
      label: '老用户分析',
      value: 'oldUser',
      children: [
        { label: '付费人数', value: 'oldUserPaying' },
        { label: '付费金额', value: 'oldUserRevenue' },
        { label: 'ARPU', value: 'oldUserArpu' },
        { label: '付费率', value: 'oldUserPayRate' },
      ]
    }
  ];

  // 过滤列配置
  const filteredColumns = columns.map(col => {
    if ('children' in col) {
      return {
        ...col,
        children: col.children?.filter(child => visibleColumns.includes(child.key as string))
      };
    }
    return col;
  });

  const filteredData = dateRange
    ? statistics.filter(item => {
        const itemDate = dayjs(item.date);
        return (itemDate.isAfter(dateRange[0], 'day') || itemDate.isSame(dateRange[0], 'day')) && 
               (itemDate.isBefore(dateRange[1], 'day') || itemDate.isSame(dateRange[1], 'day'));
      })
    : statistics;

  // 计算合计数据
  const calculateTotals = (data: DailyStatistics[]) => {
    const totals = {
      newUsers: data.reduce((sum, row) => sum + row.newUsers, 0),
      oldUsers: data.reduce((sum, row) => sum + row.oldUsers, 0),
      activeUsers: data.reduce((sum, row) => sum + row.activeUsers, 0),
      payingUsers: data.reduce((sum, row) => sum + row.payingUsers, 0),
      totalRevenue: data.reduce((sum, row) => sum + row.totalRevenue, 0),
      // 新用户分析合计
      newUserPaying: data.reduce((sum, row) => sum + row.newUserPaying, 0),
      newUserRevenue: data.reduce((sum, row) => sum + row.newUserRevenue, 0),
      // 老用户分析合计
      oldUserPaying: data.reduce((sum, row) => sum + row.oldUserPaying, 0),
      oldUserRevenue: data.reduce((sum, row) => sum + row.oldUserRevenue, 0),
    };
    
    const averages = {
      // 总体指标
      arpu: totals.totalRevenue / totals.activeUsers,
      payingArpu: totals.totalRevenue / totals.payingUsers,
      activePayRate: (totals.payingUsers / totals.activeUsers) * 100,
      // 新用户分析平均值
      newUserArpu: totals.newUserRevenue / totals.newUsers,
      newUserPayRate: (totals.newUserPaying / totals.newUsers) * 100,
      // 老用户分析平均值
      oldUserArpu: totals.oldUserRevenue / totals.oldUsers,
      oldUserPayRate: (totals.oldUserPaying / totals.oldUsers) * 100,
    };

    return {
      date: '合计',
      // 基础数据（累计之和）
      newUsers: totals.newUsers,
      oldUsers: totals.oldUsers,
      activeUsers: totals.activeUsers,
      payingUsers: totals.payingUsers,
      totalRevenue: totals.totalRevenue,
      // 总体指标（平均值）
      arpu: averages.arpu,
      payingArpu: averages.payingArpu,
      activePayRate: averages.activePayRate,
      // 新用户分析数据
      newUserPaying: totals.newUserPaying,
      newUserRevenue: totals.newUserRevenue,
      newUserArpu: averages.newUserArpu,
      newUserPayRate: averages.newUserPayRate,
      // 老用户分析数据
      oldUserPaying: totals.oldUserPaying,
      oldUserRevenue: totals.oldUserRevenue,
      oldUserArpu: averages.oldUserArpu,
      oldUserPayRate: averages.oldUserPayRate,
    } as DailyStatistics;
  };

  // 将合计行添加到数据的最前面
  const tableData = [calculateTotals(filteredData), ...filteredData];

  // 处理分组选择变化
  const handleGroupChange = (checkedGroups: string[]) => {
    setSelectedGroups(checkedGroups);
    // 更新可见列
    const newVisibleColumns = checkedGroups.reduce((acc: string[], groupKey) => {
      return [...acc, ...groupConfig[groupKey as keyof typeof groupConfig].columns];
    }, []);
    setVisibleColumns(newVisibleColumns);
  };

  // 处理分组内列选择变化
  const handleColumnChange = (group: string, checkedValues: string[]) => {
    const otherGroupColumns = visibleColumns.filter(col => 
      !groupConfig[group as keyof typeof groupConfig].columns.includes(col)
    );
    setVisibleColumns([...otherGroupColumns, ...checkedValues]);
  };

  // 检查分组是否全选
  const isGroupCheckedAll = (group: string) => {
    const groupColumns = groupConfig[group as keyof typeof groupConfig].columns;
    return groupColumns.every(col => visibleColumns.includes(col));
  };

  // 检查分组是否部分选中
  const isGroupIndeterminate = (group: string) => {
    const groupColumns = groupConfig[group as keyof typeof groupConfig].columns;
    const checkedCount = groupColumns.filter(col => visibleColumns.includes(col)).length;
    return checkedCount > 0 && checkedCount < groupColumns.length;
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
                筛选数据
              </Button>
              <ImportExport 
                onDataImported={onDataUpdate}
                currentData={statistics}
              />
            </Space>
          </div>
          
          <Table
            columns={filteredColumns}
            dataSource={tableData}
            rowKey="date"
            scroll={{ x: 2200 }}
            bordered
            size="middle"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total - 1} 条数据`,  // 减去合计行
              defaultPageSize: 31,
              pageSizeOptions: ['31', '50', '100'],
            }}
            rowClassName={(record) => record.date === '合计' ? 'total-row' : ''}
          />
        </Space>
      </Card>

      <Modal
        title="筛选显示的数据列"
        open={isFilterModalVisible}
        onOk={() => setIsFilterModalVisible(false)}
        onCancel={() => setIsFilterModalVisible(false)}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>选择分组：</div>
            <CheckboxGroup
              options={Object.values(groupConfig).map(group => ({ label: group.label, value: group.value }))}
              value={selectedGroups}
              onChange={handleGroupChange}
            />
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', marginTop: 16, paddingTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 'bold' }}>选择具体指标：</div>
            {columnOptions.map(group => (
              selectedGroups.includes(group.value) && (
                <div key={group.label}>
                  <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
                    <Checkbox
                      indeterminate={isGroupIndeterminate(group.value)}
                      checked={isGroupCheckedAll(group.value)}
                      onChange={(e) => {
                        const groupColumns = groupConfig[group.value as keyof typeof groupConfig].columns;
                        handleColumnChange(
                          group.value,
                          e.target.checked ? groupColumns : []
                        );
                      }}
                    >
                      {group.label}：
                    </Checkbox>
                  </div>
                  <CheckboxGroup
                    options={group.children}
                    value={visibleColumns}
                    onChange={(checkedValues) => handleColumnChange(group.value, checkedValues as string[])}
                  />
                </div>
              )
            ))}
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Overview; 