import { Animal, User } from '@prisma/client';

const isAnimal = (data: unknown): data is Animal => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return data?.breed;
};

export function getDefaultText(data: Animal): string;
export function getDefaultText(data: User): string;
export function getDefaultText(data: Animal | User) {
  if (isAnimal(data)) {
    return `<b>Карточка животного</b>
<b>Порода:</b> ${data.breed}
<b>Имя:</b> ${data.name || 'Не указано'}
<b>Возраст:</b> ${data.age} лет
<b>Описание:</b> ${data.description}`;
  }
  return `<b>Профиль пользователя</b>
<b>Имя:</b> ${data.name}
<b>Фамилия:</b> ${data.surname || 'Не указано'}
<b>Электронная почта:</b> ${data.email}
<b>Адрес:</b> ${data.adress}`;
}
