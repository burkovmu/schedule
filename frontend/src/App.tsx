import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Schedule from './components/Schedule';
import ViewOnlySchedule from './components/ViewOnlySchedule';
import ReferenceManager from './components/ReferenceManager';
import NotificationSystem from './components/NotificationSystem';
import LoginForm from './components/LoginForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Notification, ScheduleData } from './types';
import { fetchScheduleData } from './utils/api';

type TabType = 'schedule' | 'teachers' | 'subjects' | 'rooms' | 'groups' | 'assistants';

function AppContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [showLoginForm, setShowLoginForm] = useState(false);
  
  const { isAuthenticated, logout } = useAuth();

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);



  // Загрузка данных расписания
  const loadScheduleData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchScheduleData();
      setScheduleData(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Ошибка загрузки данных расписания'
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  const tabs = [
    { id: 'schedule' as TabType, label: 'Расписание', icon: '' },
    { id: 'teachers' as TabType, label: 'Преподаватели', icon: '' },
    { id: 'subjects' as TabType, label: 'Предметы', icon: '' },
    { id: 'rooms' as TabType, label: 'Аудитории', icon: '' },
    { id: 'groups' as TabType, label: 'Группы', icon: '' },
    { id: 'assistants' as TabType, label: 'Ассистенты', icon: '' }
  ];

  const renderTabContent = () => {
    if (!scheduleData) {
      return (
        <div className="loading">Загрузка данных...</div>
      );
    }

    // Если пользователь не аутентифицирован, показываем только расписание в режиме просмотра
    if (!isAuthenticated) {
      return (
        <ViewOnlySchedule 
          scheduleData={scheduleData}
          onLogin={() => setShowLoginForm(true)}
        />
      );
    }

    // Если пользователь аутентифицирован, показываем полную версию
    switch (activeTab) {
      case 'schedule':
        return (
          <Schedule 
            scheduleData={scheduleData}
            onNotification={addNotification}
            onRefresh={loadScheduleData}
          />
        );
      
      case 'teachers':
        return (
          <ReferenceManager
            type="teachers"
            title="Преподаватели"
            items={scheduleData.teachers}
            onRefresh={loadScheduleData}
            onNotification={addNotification}
          />
        );
      
      case 'subjects':
        return (
          <ReferenceManager
            type="subjects"
            title="Предметы"
            items={scheduleData.subjects}
            onRefresh={loadScheduleData}
            onNotification={addNotification}
          />
        );
      
      case 'rooms':
        return (
          <ReferenceManager
            type="rooms"
            title="Аудитории"
            items={scheduleData.rooms}
            onRefresh={loadScheduleData}
            onNotification={addNotification}
          />
        );
      
      case 'groups':
        return (
          <ReferenceManager
            type="groups"
            title="Группы"
            items={scheduleData.groups}
            onRefresh={loadScheduleData}
            onNotification={addNotification}
          />
        );
      
      case 'assistants':
        return (
          <ReferenceManager
            type="assistants"
            title="Ассистенты"
            items={scheduleData.assistants}
            onRefresh={loadScheduleData}
            onNotification={addNotification}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Расписание</h1>
          
          {isAuthenticated && (
            <nav className="header-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span className="nav-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          )}
          
          <div className="header-actions">
            {isAuthenticated ? (
              <button 
                className="btn-secondary logout-btn"
                onClick={logout}
                title="Выйти из системы"
              >
                Выход
              </button>
            ) : (
              <button 
                className="btn-primary login-btn"
                onClick={() => setShowLoginForm(true)}
                title="Войти в систему"
              >
                Вход
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="app-main">
        {loading ? (
          <div className="loading">Загрузка приложения...</div>
        ) : (
          renderTabContent()
        )}
      </main>
      
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
      
      {/* Модальное окно входа */}
      {showLoginForm && (
        <LoginForm onClose={() => setShowLoginForm(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;