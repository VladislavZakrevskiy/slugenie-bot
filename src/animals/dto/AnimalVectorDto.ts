import { $Enums } from '@prisma/client';
export interface CreateDogDto {
  breed: string;
  size: $Enums.Size;
  age: $Enums.Age;
  fur: $Enums.Fur;
  photo: string;
}
