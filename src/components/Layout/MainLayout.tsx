import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, BarChartOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
        <Sider width={200}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['overview']}
            style={{ height: '100%' }}
          >
            <Menu.Item key="overview" icon={<BarChartOutlined />}>
              数据概览
            </Menu.Item>
          </Menu>
        </Sider>
        
        <Content style={{ padding: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 