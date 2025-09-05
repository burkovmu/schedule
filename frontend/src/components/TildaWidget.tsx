import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleData } from '../types';
import { fetchScheduleData } from '../utils/api';
import ViewOnlySchedule from './ViewOnlySchedule';

interface TildaWidgetProps {
  apiUrl?: string;
  height?: string;
  width?: string;
}

const TildaWidget: React.FC<TildaWidgetProps> = ({ 
  apiUrl = 'https://your-api-url.com',
  height = '600px',
  width = '100%'
}) => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScheduleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScheduleData();
      setScheduleData(data);
    } catch (error) {
      setError('Ошибка загрузки данных расписания');
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  if (loading) {
    return (
      <div style={{ 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Загрузка расписания...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height, 
        width, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ff6b6b',
        borderRadius: '8px',
        backgroundColor: '#ffe0e0',
        color: '#d63031',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>⚠️</div>
        <div>{error}</div>
        <button 
          onClick={loadScheduleData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      height, 
      width, 
      overflow: 'hidden',
      backgroundColor: 'white',
      borderRadius: '8px'
    }}>
      <ViewOnlySchedule 
        scheduleData={scheduleData}
        onLogin={() => {
          // Для Tilda открываем админку в новом окне
          const baseUrl = window.location.origin;
          window.open(`${baseUrl}/admin.html`, '_blank');
        }}
      />
    </div>
  );
};

export default TildaWidget;
