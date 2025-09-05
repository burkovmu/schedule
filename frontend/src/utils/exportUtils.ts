import html2canvas from 'html2canvas';

/**
 * Экспортирует расписание в PNG изображение
 * @param elementId - ID элемента для экспорта
 * @param filename - Имя файла (по умолчанию 'schedule.png')
 */
export const exportScheduleToPNG = async (
  elementId: string,
  filename: string = 'schedule.png'
): Promise<void> => {
  try {
    console.log('Начинаем экспорт с скрытием элементов редактирования...', { elementId, filename });
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Элемент с ID "${elementId}" не найден`);
    }

    console.log('Элемент найден, скрываем элементы редактирования...');

    // Скрываем элементы редактирования
    const editElements = element.querySelectorAll('.lesson-actions, .lesson-resize-btn, .btn-edit, .btn-delete, .btn-edit-small, .btn-delete-small');
    const originalStyles: { element: Element; display: string }[] = [];
    
    editElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      originalStyles.push({ element: el, display: htmlEl.style.display });
      htmlEl.style.display = 'none';
    });

    // Ждем применения изменений
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('Создаем canvas...');

    // Создаем canvas с высоким разрешением
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff',
      logging: true,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    console.log('Canvas создан:', canvas.width, 'x', canvas.height);

    // Восстанавливаем элементы редактирования
    originalStyles.forEach(({ element, display }) => {
      const htmlEl = element as HTMLElement;
      htmlEl.style.display = display;
    });

    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    
    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Экспорт завершен успешно');
  } catch (error) {
    console.error('Ошибка при экспорте расписания:', error);
    throw new Error(`Не удалось экспортировать расписание в PNG: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};

/**
 * Экспортирует расписание с текущим масштабом
 * @param elementId - ID элемента для экспорта
 * @param zoomLevel - Текущий уровень масштабирования
 * @param filename - Имя файла
 */
export const exportScheduleWithZoom = async (
  elementId: string,
  zoomLevel: number,
  filename: string = 'schedule.png'
): Promise<void> => {
  try {
    console.log('Начинаем экспорт расписания с масштабом...', { elementId, zoomLevel, filename });
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Элемент не найден:', elementId);
      throw new Error(`Элемент с ID "${elementId}" не найден`);
    }

    console.log('Элемент найден, скрываем элементы редактирования...');

    // Скрываем элементы редактирования
    const editElements = element.querySelectorAll('.lesson-actions, .lesson-resize-btn, .btn-edit, .btn-delete, .btn-edit-small, .btn-delete-small');
    const originalStyles: { element: Element; display: string }[] = [];
    
    editElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      originalStyles.push({ element: el, display: htmlEl.style.display });
      htmlEl.style.display = 'none';
    });

    // Временно сбрасываем масштаб для корректного экспорта
    const originalTransform = element.style.transform;
    const originalHeight = element.style.height;
    
    element.style.transform = 'scale(1)';
    element.style.height = 'auto';

    // Ждем небольшое время для применения изменений
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Создаем canvas...', {
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight
    });

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      background: '#ffffff',
      logging: true,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    console.log('Canvas создан:', canvas.width, 'x', canvas.height);

    // Восстанавливаем оригинальный масштаб
    element.style.transform = originalTransform;
    element.style.height = originalHeight;

    // Восстанавливаем элементы редактирования
    originalStyles.forEach(({ element, display }) => {
      const htmlEl = element as HTMLElement;
      htmlEl.style.display = display;
    });

    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('Экспорт завершен успешно');
  } catch (error) {
    console.error('Ошибка при экспорте расписания:', error);
    throw new Error(`Не удалось экспортировать расписание в PNG: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
  }
};
