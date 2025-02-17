import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Overview from './components/Dashboard/Overview';
import Retention from './components/Dashboard/Retention';
import { GameStatistics } from './types/statistics';
import { generateInitialData } from './utils/mockData';

const initialMockData = generateInitialData();

const App: React.FC = () => {
  const [data, setData] = useState<GameStatistics>(() => {
    // 生成初始数据，确保有足够的数据用于留存计算
    const mockData = generateInitialData();
    // 生成90天的数据，以便计算更长期的留存
    return mockData.concat(generateInitialData());
  });
  
  return (
    <MainLayout>
      <Routes>
        <Route path="/overview" element={<Overview statistics={data} onDataUpdate={setData} />} />
        <Route path="/retention" element={<Retention statistics={data} onDataUpdate={setData} />} />
        <Route path="/" element={<Navigate to="/overview" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default App; 