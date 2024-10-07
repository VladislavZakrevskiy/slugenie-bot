import { $Enums } from '@prisma/client';
export interface NormalizedAnimal {
  breed: string;
  size: $Enums.Size;
  age: string;
  fur: string;
  photo: {
    className: string;
    probability: number;
  }[];
}
