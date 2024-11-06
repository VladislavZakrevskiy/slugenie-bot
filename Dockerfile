# Устанавливаем базовый образ с Node.js
FROM node:21

# Устанавливаем рабочую директорию
WORKDIR /app

COPY ./package.json ./package.json

COPY ./package-lock.json ./package-lock.json

# Устанавливаем зависимости без bcrypt
RUN npm install 

# Копируем весь исходный код проекта
COPY ./src ./src

COPY ./prisma ./prisma

COPY /.env ./.env

COPY ./tsconfig.json ./tsconfig.json

# Устанавливаем bcrypt для текущей системы (в контейнере)
RUN npm rebuild bcrypt --build-from-source

# Генерируем Prisma клиент
RUN npx prisma generate

# Компилируем приложение NestJS
RUN npm run build

# Указываем команду для запуска приложения
CMD ["npm", "run", "start:prod"]

# Указываем порт, на котором работает приложение
EXPOSE 3000
