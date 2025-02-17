import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, BarChartOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: 'overview',
      icon: <BarChartOutlined />,
      label: '数据概览'
    },
    {
      key: 'retention',
      icon: <BarChartOutlined />,
      label: '新增留存'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'white' }}>游戏后台统计分析</h1>
        <div style={{ color: 'white' }}>
          <span style={{ marginRight: 16 }}>
            <UserOutlined /> 管理员
          </span>
          <LogoutOutlined /> 退出登录
        </div>
      </Header>
      
      <Layout>
        <Sider 
          width={200} 
          collapsible 
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
        >
          <div style={{ 
            padding: '16px', 
            textAlign: 'right', 
            color: 'white',
            cursor: 'pointer'
          }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname.replace('/', '') || 'overview']}
            style={{ height: '100%' }}
            onClick={({ key }) => navigate(`/${key}`)}
            items={menuItems}
          />
        </Sider>
        
        <Content style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 