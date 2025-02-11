import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import MainLayout from './components/Layout/MainLayout';
import Overview from './components/Dashboard/Overview';
import { GameStatistics, DailyStatistics } from './types/statistics';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// 扩展 dayjs
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// 生成初始模拟数据
const generateInitialData = (): GameStatistics => {
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

  return mockData;
};

const initialMockData = generateInitialData();

const App: React.FC = () => {
  const [data, setData] = useState<GameStatistics>(initialMockData);
  
  return (
    <ConfigProvider locale={zhCN}>
      <MainLayout>
        <Overview 
          statistics={data} 
          onDataUpdate={setData}
        />
      </MainLayout>
    </ConfigProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <App />
); 