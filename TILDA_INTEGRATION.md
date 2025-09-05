# 🎯 Инструкция по встраиванию в Tilda

## ✅ Что уже сделано

Я создал все необходимые файлы для встраивания вашего приложения расписания в Tilda:

1. **`frontend/public/embed.html`** - специальная страница для встраивания
2. **`frontend/src/components/TildaWidget.tsx`** - компонент виджета
3. **Обновлен `App.tsx`** - добавлена поддержка режима встраивания
4. **Обновлен `backend/server.js`** - настроен CORS для Tilda
5. **Обновлен `App.css`** - добавлены стили для встраивания

## 🚀 Что нужно сделать ВАМ

### Шаг 1: Отправить изменения в Git

```bash
cd /Users/mike/Desktop/rasp2
git add .
git commit -m "Добавлена поддержка встраивания в Tilda"
git push origin main
```

### Шаг 2: Дождаться развертывания на Vercel

- Vercel автоматически пересоберет и развернет приложение
- Получите URL вашего приложения (например: `https://rasp2-xyz123.vercel.app`)

### Шаг 3: Встроить в Tilda

1. **Войдите в редактор Tilda**
2. **Откройте нужную страницу**
3. **Добавьте блок "HTML"** (найдите в панели блоков)
4. **Вставьте этот код:**

```html
<div class="schedule-widget-container">
    <iframe 
        src="https://ВАШ-URL.vercel.app/embed.html" 
        width="100%" 
        height="700px" 
        frameborder="0"
        scrolling="auto"
        style="
            border: none; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            background: white;
        "
        title="Расписание занятий">
    </iframe>
</div>

<style>
.schedule-widget-container {
    margin: 20px 0;
    padding: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
}

/* Адаптивность */
@media (max-width: 768px) {
    .schedule-widget-container iframe {
        height: 500px;
    }
}

@media (max-width: 480px) {
    .schedule-widget-container iframe {
        height: 400px;
    }
}
</style>
```

### Шаг 4: Настроить CORS (важно!)

В файле `backend/server.js` найдите строку:
```javascript
'https://your-tilda-site.tilda.ws'
```

Замените на ваш реальный домен Tilda:
```javascript
'https://ваш-сайт.tilda.ws'
```

Затем снова отправьте в Git:
```bash
git add backend/server.js
git commit -m "Обновлен CORS для домена Tilda"
git push origin main
```

## 🎨 Дополнительные настройки

### Изменение высоты виджета

```html
<!-- Для высокой страницы -->
<iframe src="https://ВАШ-URL.vercel.app/embed.html" height="800px">

<!-- Для компактной страницы -->
<iframe src="https://ВАШ-URL.vercel.app/embed.html" height="500px">
```

### Передача параметров

```html
<!-- Темная тема -->
<iframe src="https://ВАШ-URL.vercel.app/embed.html?theme=dark">

<!-- Кастомная высота -->
<iframe src="https://ВАШ-URL.vercel.app/embed.html?height=600px">
```

## 🔧 Устранение проблем

### Если виджет не загружается:

1. **Проверьте URL** - убедитесь, что приложение развернуто
2. **Проверьте CORS** - добавьте ваш домен Tilda в настройки
3. **Проверьте консоль браузера** - посмотрите на ошибки

### Если виджет загружается, но не работает:

1. **Проверьте API** - убедитесь, что backend работает
2. **Проверьте данные** - убедитесь, что в базе есть данные

## 📱 Адаптивность

Виджет автоматически адаптируется под размер экрана:
- **Десктоп**: полная высота (700px)
- **Планшет**: средняя высота (500px)  
- **Мобильный**: компактная высота (400px)

## 🎯 Результат

После выполнения всех шагов у вас будет:
- ✅ Работающий виджет расписания на странице Tilda
- ✅ Адаптивный дизайн для всех устройств
- ✅ Возможность просмотра расписания без входа в систему
- ✅ Кнопка входа для администраторов

## 🆘 Поддержка

Если что-то не работает:
1. Проверьте консоль браузера (F12)
2. Убедитесь, что все URL правильные
3. Проверьте, что CORS настроен корректно
4. Убедитесь, что приложение развернуто на Vercel

---

**Готово!** 🎉 Ваше приложение расписания теперь можно встроить в любую страницу Tilda.
