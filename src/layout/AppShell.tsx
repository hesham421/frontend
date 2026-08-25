import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useLanguage } from '../context/LanguageContext';
import { ScreenType } from '../stores/useNavigationStore';

export interface AppShellProps {
  activeScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  title: string;
  breadcrumb?: string;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeScreen,
  onNavigate,
  onLogout,
  title,
  breadcrumb,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dir } = useLanguage();

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        direction: dir,
        background: 'var(--surface-page, #F8FAFC)',
        color: 'var(--text-body, #354456)',
        overflow: 'hidden',
      }}
    >
      <div className="avl-app" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={(screen) => {
            onNavigate(screen);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div
          className="avl-app__body"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100%',
          }}
        >
          <Topbar
            title={title}
            breadcrumb={breadcrumb}
            onLogout={onLogout}
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          />

          <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="avl-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
