import { Age, Animal, Fur, Size, User } from '@prisma/client';

const isAnimal = (data: unknown): data is Animal => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return data?.breed;
};

export const AgeTranslation: Record<Age, string> = {
  ADULT: 'Взрослый/ая',
  PUPPY: 'Щенок',
  SENIOR: 'Старый/ая',
  YOUNG: 'Молодой/ая',
};

export const FurTranslation: Record<Fur, string> = {
  LONG: 'Длинная шерсть',
  MEDIUM: 'Средняя шерсть',
  NO: 'Лысый/ая',
  SHORT: 'Короткая шерсть',
};

export const SizeTranslation: Record<Size, string> = {
  BIG: 'Большой/ая',
  MEDIUM: 'Средний/ая',
  SMALL: 'Маленький/ая',
  VERY_BIG: 'Очень большой/ая',
  VERY_SMALL: 'Очень маленькая/ая',
};

export function getDefaultText(data: Animal): string;
export function getDefaultText(data: User): string;
export function getDefaultText(data: Animal | User) {
  if (isAnimal(data)) {
    return `<b>Карточка животного</b>
<b>Порода:</b> ${data.breed}
<b>Имя:</b> ${data.name || 'Не указано'}
<b>Возраст:</b> ${data.age ? AgeTranslation[data.age] : 'Не указано'}
<b>Возраст:</b> ${data.size ? SizeTranslation[data.size] : 'Не указано'}
<b>Шерсть:</b> ${data.fur ? FurTranslation[data.fur] : 'Не указано'}
<b>Описание:</b> ${data.description}`;
  }
  return `<b>Профиль пользователя</b>
<b>Имя:</b> ${data.name}
<b>Фамилия:</b> ${data.surname || 'Не указано'}
<b>Электронная почта:</b> ${data.email}
<b>Адрес:</b> ${data.adress}`;
}
