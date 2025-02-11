import React from 'react';
import { Button, Dropdown, Upload, message, Modal, Input, Space, InputNumber, DatePicker } from 'antd';
import { MoreOutlined, UploadOutlined, DownloadOutlined, FileAddOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { DailyStatistics } from '../../types/statistics';
import dayjs from 'dayjs';
import { convertToCSV, parseCSV } from '../../utils/csvHelper';
import type { MenuProps } from 'antd';

interface ImportExportProps {
  onDataImported: (data: DailyStatistics[]) => void;
  currentData: DailyStatistics[];
}

const { RangePicker } = DatePicker;

const ImportExport: React.FC<ImportExportProps> = ({ onDataImported, currentData }) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [targetRevenue, setTargetRevenue] = React.useState<number>(10000);
  const [fluctuation, setFluctuation] = React.useState<number>(20);
  const [arpuRange, setArpuRange] = React.useState<[number, number]>([20, 50]);
  const [payingArpuRange, setPayingArpuRange] = React.useState<[number, number]>([80, 150]);
  const [dateRange, setDateRange] = React.useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs().subtract(1, 'day')
  ]);

  // 生成随机数据
  const generateMockData = () => {
    const startDate = dayjs().subtract(30, 'day');
    const mockData: DailyStatistics[] = [];

    for (let i = 0; i < 30; i++) {
      const date = startDate.add(i, 'day');
      const baseUsers = Math.floor(Math.random() * 500) + 100;
      const newUsers = Math.floor(Math.random() * 200) + 50;
      const oldUsers = baseUsers;
      const activeUsers = newUsers + oldUsers;
      const payingUsers = Math.floor(activeUsers * (Math.random() * 0.3 + 0.1));
      const totalRevenue = payingUsers * (Math.random() * 100 + 50);

      mockData.push({
        date: date.format('YYYY-MM-DD'),
        newUsers,
        oldUsers,
        activeUsers,
        payingUsers,
        totalRevenue,
        arpu: totalRevenue / activeUsers,
        payingArpu: totalRevenue / payingUsers,
        activePayRate: (payingUsers / activeUsers) * 100,
        newUserPaying: Math.floor(newUsers * (Math.random() * 0.3 + 0.1)),
        newUserRevenue: Math.floor(totalRevenue * (Math.random() * 0.3 + 0.1)),
        newUserArpu: 0, // 将在下面计算
        newUserPayRate: 0, // 将在下面计算
        oldUserPaying: 0, // 将在下面计算
        oldUserRevenue: 0, // 将在下面计算
        oldUserArpu: 0, // 将在下面计算
        oldUserPayRate: 0, // 将在下面计算
      });

      // 计算衍生数据
      const lastItem = mockData[mockData.length - 1];
      lastItem.newUserArpu = lastItem.newUserRevenue / lastItem.newUserPaying;
      lastItem.newUserPayRate = (lastItem.newUserPaying / lastItem.newUsers) * 100;
      lastItem.oldUserPaying = lastItem.payingUsers - lastItem.newUserPaying;
      lastItem.oldUserRevenue = lastItem.totalRevenue - lastItem.newUserRevenue;
      lastItem.oldUserArpu = lastItem.oldUserRevenue / lastItem.oldUserPaying;
      lastItem.oldUserPayRate = (lastItem.oldUserPaying / lastItem.oldUsers) * 100;
    }

    onDataImported(mockData);
    message.success('已生成30天的模拟数据');
  };

  // 生成指定总收入的数据
  const generateTargetData = () => {
    const mockData: DailyStatistics[] = [];
    
    // 计算天数
    const days = dateRange[1].diff(dateRange[0], 'day') + 1;
    
    // 计算每天的平均收入
    const avgDailyRevenue = targetRevenue / days;
    
    for (let i = 0; i < days; i++) {
      const date = dateRange[0].add(i, 'day');
      
      // 在平均值基础上添加波动
      const fluctuationRange = avgDailyRevenue * (fluctuation / 100);
      const dailyRevenue = avgDailyRevenue + (Math.random() * 2 - 1) * fluctuationRange;
      
      // 根据ARPU范围生成活跃用户数
      const randomArpu = arpuRange[0] + Math.random() * (arpuRange[1] - arpuRange[0]);
      const activeUsers = Math.floor(dailyRevenue / randomArpu);
      
      // 根据付费ARPU范围生成付费用户数
      const randomPayingArpu = payingArpuRange[0] + Math.random() * (payingArpuRange[1] - payingArpuRange[0]);
      const payingUsers = Math.floor(dailyRevenue / randomPayingArpu);

      const newUsers = Math.floor(activeUsers * 0.3);
      const oldUsers = activeUsers - newUsers;

      mockData.push({
        date: date.format('YYYY-MM-DD'),
        newUsers,
        oldUsers,
        activeUsers,
        payingUsers,
        totalRevenue: dailyRevenue,
        arpu: dailyRevenue / activeUsers,
        payingArpu: dailyRevenue / payingUsers,
        activePayRate: (payingUsers / activeUsers) * 100,
        newUserPaying: Math.floor(newUsers * 0.15),
        newUserRevenue: dailyRevenue * 0.3,
        newUserArpu: 0,
        newUserPayRate: 0,
        oldUserPaying: 0,
        oldUserRevenue: 0,
        oldUserArpu: 0,
        oldUserPayRate: 0,
      });

      // 计算衍生数据
      const lastItem = mockData[mockData.length - 1];
      lastItem.newUserArpu = lastItem.newUserRevenue / lastItem.newUserPaying;
      lastItem.newUserPayRate = (lastItem.newUserPaying / lastItem.newUsers) * 100;
      lastItem.oldUserPaying = lastItem.payingUsers - lastItem.newUserPaying;
      lastItem.oldUserRevenue = lastItem.totalRevenue - lastItem.newUserRevenue;
      lastItem.oldUserArpu = lastItem.oldUserRevenue / lastItem.oldUserPaying;
      lastItem.oldUserPayRate = (lastItem.oldUserPaying / lastItem.oldUsers) * 100;
    }

    onDataImported(mockData);
    message.success(`已生成 ${dateRange[0].format('YYYY-MM-DD')} 至 ${dateRange[1].format('YYYY-MM-DD')} 的模拟数据`);
    setIsModalVisible(false);
  };

  // 导出数据
  const exportData = () => {
    const csvContent = convertToCSV(currentData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `game_statistics_${dayjs().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('数据导出成功');
  };

  // 导入数据
  const uploadProps: UploadProps = {
    accept: '.csv',
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target?.result as string;
          const data = parseCSV(csvContent);
          if (data.length > 0) {
            onDataImported(data);
            message.success('数据导入成功');
          } else {
            message.error('文件格式错误');
          }
        } catch (error) {
          message.error('文件解析失败');
        }
      };
      reader.readAsText(file);
      return false;
    },
  };

  const items: MenuProps['items'] = [
    {
      key: 'generate',
      icon: <FileAddOutlined />,
      label: '生成模拟数据',
      onClick: generateMockData,
    },
    {
      key: 'generateTarget',
      icon: <FileAddOutlined />,
      label: '生成总计数据',
      onClick: () => setIsModalVisible(true),
    },
    {
      key: 'import',
      icon: <UploadOutlined />,
      label: (
        <Upload {...uploadProps}>
          <span>导入数据</span>
        </Upload>
      ),
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: '导出数据',
      onClick: exportData,
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
        <Button icon={<MoreOutlined />} />
      </Dropdown>

      <Modal
        title="生成指定收入数据"
        open={isModalVisible}
        onOk={generateTargetData}
        onCancel={() => setIsModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: 8 }}>时间范围：</div>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              allowClear={false}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>总收入目标：</div>
            <InputNumber
              style={{ width: '100%' }}
              value={targetRevenue}
              onChange={(value) => setTargetRevenue(value || 0)}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/[^\d.-]/g, ''))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>日收入波动范围（%）：</div>
            <InputNumber
              style={{ width: '100%' }}
              value={fluctuation}
              onChange={(value) => setFluctuation(value || 0)}
              min={0}
              max={100}
              formatter={value => `${value}%`}
              parser={value => parseFloat(value!.replace('%', ''))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>ARPU范围：</div>
            <Space style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%' }}
                value={arpuRange[0]}
                onChange={(value) => setArpuRange([value || 0, arpuRange[1]])}
                formatter={(value) => `¥ ${value}`}
                parser={(value) => parseFloat(value!.replace(/[^\d.-]/g, ''))}
              />
              <span>至</span>
              <InputNumber
                style={{ width: '100%' }}
                value={arpuRange[1]}
                onChange={(value) => setArpuRange([arpuRange[0], value || 0])}
                formatter={(value) => `¥ ${value}`}
                parser={(value) => parseFloat(value!.replace(/[^\d.-]/g, ''))}
              />
            </Space>
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>付费ARPU范围：</div>
            <Space style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '100%' }}
                value={payingArpuRange[0]}
                onChange={(value) => setPayingArpuRange([value || 0, payingArpuRange[1]])}
                formatter={(value) => `¥ ${value}`}
                parser={(value) => parseFloat(value!.replace(/[^\d.-]/g, ''))}
              />
              <span>至</span>
              <InputNumber
                style={{ width: '100%' }}
                value={payingArpuRange[1]}
                onChange={(value) => setPayingArpuRange([payingArpuRange[0], value || 0])}
                formatter={(value) => `¥ ${value}`}
                parser={(value) => parseFloat(value!.replace(/[^\d.-]/g, ''))}
              />
            </Space>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default ImportExport; 