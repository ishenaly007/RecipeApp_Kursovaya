# RecipeApp

## 📖 Описание проекта

RecipeApp — это веб-приложение для кулинарных энтузиастов.

Функционал приложения включает:

- 🔐 **Регистрацию и авторизацию пользователей**
- 📝 **Создание, редактирование и удаление рецептов**
- 🥗 **Добавление ингредиентов и этапов приготовления**
- 💬 **Комментирование и оценивание рецептов**
- 👍 **Ставить "лайки" и загружать фотографии рецептов**

Приложение построено с использованием **Node.js**, **Express** и **PostgreSQL**.

---

## 🗂️ Структура базы данных

### Таблица пользователей и остальные

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    average_rating FLOAT DEFAULT 0
);

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity VARCHAR(50),
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE steps (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    step_number INT NOT NULL,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipe_photos (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL
);
```

---

## 🚀 Установка и запуск

### 1. Клонирование репозитория

Склонируйте проект на ваш локальный компьютер:

```bash
git clone https://ishenaly007/RecipeApp_Kursovaya.git
cd RecipeApp_Kursovaya

```

### 2. Установка зависимостей

Убедитесь, что у вас установлен **Node.js** и **npm**. Затем установите необходимые зависимости:

```bash
npm install
```

### 4. Конфигурация и запуск бекенда

1. Перейдите в папку с серверной частью:

   ```bash
   cd recipe-app
   ```

2. В файле конфигурации базы данных (.env), установите параметры подключения к базе данных:

   ```bash
   DB_PORT=5432
   DB_USER=asasas
   DB_PASSWORD=asasas
   DB_NAME=asasas
   PORT=3000
   SECRET_KEY=asasas
   ```
3. Запустите сервер:

   ```bash
   node server.js
   ```
   Сервер будет доступен по адресу http://localhost:3000.

------
### 5. Конфигурация и запуск фронтенда

1. Перейдите в папку с фронтенд-частью проекта:

   ```bash
   cd recipe-app-frontend

2. Установите все необходимые зависимости с помощью npm:

   ```bash
   npm install

3. Для запуска фронтенда выполните команду:

   ```bash
   npm start

Если вам нужно изменить порт, на котором запускается приложение, откройте файл `.env` и добавьте или измените поле в разделе `PORT`:

```bash
PORT:3001
```
Это заставит ваше приложение запускаться на порту `3001` вместо `3000`.

При успешном запуске фронтенда, приложение будет автоматически перезагружаться при изменении исходного кода, благодаря настройкам Webpack Dev Server, который используется по умолчанию в React-приложениях.

Теперь вы можете продолжить разработку интерфейса и тестирование приложения, при этом все изменения будут отображаться в реальном времени на веб-странице.

Если возникнут проблемы с запуском, убедитесь, что все зависимости правильно установлены и что сервер разработки не заблокирован другим процессом. Также проверьте консоль на наличие ошибок или предупреждений, которые могут помочь в диагностике проблемы.

------

### 6. Тестирование

1. Пройдите через страницу регистрации и авторизации.
2. Создайте новый рецепт, добавьте ингредиенты, этапы приготовления и фотографии.
3. Оставьте комментарии и ставьте лайки под рецептами.

------

### 7. Зависимости

#### Серверная часть (Backend):
- **Express** - веб-фреймворк для Node.js.
- **pg** - библиотека для работы с PostgreSQL.
- **bcryptjs** - для хеширования паролей.
- **jsonwebtoken** - для генерации и проверки JWT.
- **cors** - для обработки запросов из разных источников.

#### Клиентская часть (Frontend):
- **React** - библиотека для создания пользовательского интерфейса.
- **axios** - для отправки HTTP-запросов.
- **react-router-dom** - для роутинга в приложении.

------

### 8. Советы

- Для удобства разработки вы можете использовать **Postman** для тестирования API-запросов.
- Убедитесь, что сервер и фронтенд работают на разных портах, чтобы избежать конфликтов.
