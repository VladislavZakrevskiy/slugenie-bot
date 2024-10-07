import { $Enums } from '@prisma/client';
export interface AnimalFormDto {
  breed: string;
  name?: string;
  age: $Enums.Age;
  size: $Enums.Size;
  fur: $Enums.Fur;
  description: string;
  adress: string;
  publicaterId: string;
  image_url: string[];
}
