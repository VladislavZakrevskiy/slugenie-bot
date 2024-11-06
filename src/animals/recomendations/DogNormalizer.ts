import { levenshtein } from 'src/core/helpers/levenshtein';
import { CreateDogDto } from 'src/animals/dto/AnimalVectorDto';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Jimp } from 'jimp';
import { $Enums } from '@prisma/client';

// ПЛОХО НО (●'◡'●)
const dog_breeds = [
  'Affenpinscher',
  'Afghan Hound',
  'African Hunting Dog',
  'Airedale Terrier',
  'Akbash Dog',
  'Akita',
  'Alapaha Blue Blood Bulldog',
  'Alaskan Husky',
  'Alaskan Malamute',
  'American Bulldog',
  'American Bully',
  'American Eskimo Dog',
  'American Eskimo Dog (Miniature)',
  'American Foxhound',
  'American Pit Bull Terrier',
  'American Staffordshire Terrier',
  'American Water Spaniel',
  'Anatolian Shepherd Dog',
  'Appenzeller Sennenhund',
  'Australian Cattle Dog',
  'Australian Kelpie',
  'Australian Shepherd',
  'Australian Terrier',
  'Azawakh',
  'Barbet',
  'Basenji',
  'Basset Bleu de Gascogne',
  'Basset Hound',
  'Beagle',
  'Bearded Collie',
  'Beauceron',
  'Bedlington Terrier',
  'Belgian Malinois',
  'Belgian Tervuren',
  'Bernese Mountain Dog',
  'Bichon Frise',
  'Black and Tan Coonhound',
  'Bloodhound',
  'Bluetick Coonhound',
  'Boerboel',
  'Border Collie',
  'Border Terrier',
  'Boston Terrier',
  'Bouvier des Flandres',
  'Boxer',
  'Boykin Spaniel',
  'Bracco Italiano',
  'Briard',
  'Brittany',
  'Bull Terrier',
  'Bull Terrier (Miniature)',
  'Bullmastiff',
  'Cairn Terrier',
  'Cane Corso',
  'Cardigan Welsh Corgi',
  'Catahoula Leopard Dog',
  'Caucasian Shepherd (Ovcharka)',
  'Cavalier King Charles Spaniel',
  'Chesapeake Bay Retriever',
  'Chinese Crested',
  'Chinese Shar-Pei',
  'Chinook',
  'Chow Chow',
  'Clumber Spaniel',
  'Cocker Spaniel',
  'Cocker Spaniel (American)',
  'Coton de Tulear',
  'Dalmatian',
  'Doberman Pinscher',
  'Dogo Argentino',
  'Dutch Shepherd',
  'English Setter',
  'English Shepherd',
  'English Springer Spaniel',
  'English Toy Spaniel',
  'English Toy Terrier',
  'Eurasier',
  'Field Spaniel',
  'Finnish Lapphund',
  'Finnish Spitz',
  'French Bulldog',
  'German Pinscher',
  'German Shepherd Dog',
  'German Shorthaired Pointer',
  'Giant Schnauzer',
  'Glen of Imaal Terrier',
  'Golden Retriever',
  'Gordon Setter',
  'Great Dane',
  'Great Pyrenees',
  'Greyhound',
  'Griffon Bruxellois',
  'Harrier',
  'Havanese',
  'Irish Setter',
  'Irish Terrier',
  'Irish Wolfhound',
  'Italian Greyhound',
  'Japanese Chin',
  'Japanese Spitz',
  'Keeshond',
  'Komondor',
  'Kooikerhondje',
  'Kuvasz',
  'Labrador Retriever',
  'Lagotto Romagnolo',
  'Lancashire Heeler',
  'Leonberger',
  'Lhasa Apso',
  'Maltese',
  'Miniature American Shepherd',
  'Miniature Pinscher',
  'Miniature Schnauzer',
  'Newfoundland',
  'Norfolk Terrier',
  'Norwich Terrier',
  'Nova Scotia Duck Tolling Retriever',
  'Old English Sheepdog',
  'Olde English Bulldogge',
  'Papillon',
  'Pekingese',
  'Pembroke Welsh Corgi',
  'Perro de Presa Canario',
  'Pharaoh Hound',
  'Plott',
  'Pomeranian',
  'Poodle (Miniature)',
  'Poodle (Toy)',
  'Pug',
  'Puli',
  'Pumi',
  'Rat Terrier',
  'Redbone Coonhound',
  'Rhodesian Ridgeback',
  'Rottweiler',
  'Russian Toy',
  'Saint Bernard',
  'Saluki',
  'Samoyed',
  'Schipperke',
  'Scottish Deerhound',
  'Scottish Terrier',
  'Shetland Sheepdog',
  'Shiba Inu',
  'Shih Tzu',
  'Shiloh Shepherd',
  'Siberian Husky',
  'Silky Terrier',
  'Smooth Fox Terrier',
  'Soft Coated Wheaten Terrier',
  'Spanish Water Dog',
  'Spinone Italiano',
  'Staffordshire Bull Terrier',
  'Standard Schnauzer',
  'Swedish Vallhund',
  'Thai Ridgeback',
  'Tibetan Mastiff',
  'Tibetan Spaniel',
  'Tibetan Terrier',
  'Toy Fox Terrier',
  'Treeing Walker Coonhound',
  'Vizsla',
  'Weimaraner',
  'Welsh Springer Spaniel',
  'West Highland White Terrier',
  'Whippet',
  'White Shepherd',
  'Wire Fox Terrier',
  'Wirehaired Pointing Griffon',
  'Wirehaired Vizsla',
  'Xoloitzcuintli',
  'Yorkshire Terrier',
];

export interface NormalizedDogChar {
  breed: string;
  size: number;
  age: number;
  fur: number;
  photo: {
    className: string;
    probability: number;
  };
}

export class DogNormalizer {
  constructor() {}

  normalizeSize(size: $Enums.Size) {
    switch (size) {
      case $Enums.Size.BIG:
        return 0.75;
      case $Enums.Size.MEDIUM:
        return 0.5;
      case $Enums.Size.SMALL:
        return 0.25;
      case $Enums.Size.VERY_BIG:
        return 1;
      case $Enums.Size.VERY_SMALL:
        return 0;
      default:
        return 1;
    }
  }

  normalizeAge(age: $Enums.Age) {
    switch (age) {
      case $Enums.Age.ADULT:
        return 0.67;
      case $Enums.Age.PUPPY:
        return 0.33;
      case $Enums.Age.SENIOR:
        return 1;
      case $Enums.Age.YOUNG:
        return 0;
      default:
        return 1;
    }
  }

  normalizeFur(fur: $Enums.Fur) {
    switch (fur) {
      case $Enums.Fur.MEDIUM:
        return 0.67;
      case $Enums.Fur.SHORT:
        return 0.33;
      case $Enums.Fur.LONG:
        return 1;
      case $Enums.Fur.NO:
        return 0;
      default:
        return 1;
    }
  }

  private findClosestBreed(breeds: string[], inputBreed: string): string {
    const lowerCaseBreed = inputBreed.toLowerCase().trim();

    const closestBreed = breeds.reduce((prev, curr) => {
      const distanceToPrev = levenshtein(lowerCaseBreed, prev.toLowerCase());
      const distanceToCurr = levenshtein(lowerCaseBreed, curr.toLowerCase());
      return distanceToCurr < distanceToPrev ? curr : prev;
    });

    return closestBreed;
  }

  public async normalizeBreed(inputBreed: string) {
    return this.findClosestBreed(dog_breeds, inputBreed);
  }

  async loadModel() {
    const model = await mobilenet.load();
    return model;
  }

  async loadImage(imagePath: string) {
    const image = await Jimp.read(imagePath);
    const { data, width, height } = image.bitmap;
    const imageTensor = tf.tensor3d(new Uint8Array(data), [height, width, 4]);
    const rgbTensor = imageTensor.slice([0, 0, 0], [-1, -1, 3]);
    const resized = tf.image.resizeBilinear(rgbTensor, [224, 224]);
    const normalized = resized.div(127.5).sub(1);
    const batched = normalized.expandDims(0);
    if (batched.shape[1] === 224 && batched.shape[2] === 224 && batched.shape[3] === 3) {
      return batched as tf.Tensor<tf.Rank.R3>;
    } else {
      throw new Error('Тензор не соответствует ожидаемым размерам.');
    }
  }

  async classifyImage(imagePath: string) {
    const model = await this.loadModel();
    const imageTensor = await this.loadImage(imagePath);

    const predictions = await model.classify(imageTensor);
    console.log('Результаты предсказания:', predictions);
    return predictions;
  }

  public async normalize(dog: CreateDogDto): Promise<NormalizedDogChar> {
    return {
      breed: await this.normalizeBreed(dog.breed),
      size: this.normalizeSize(dog.size),
      age: this.normalizeAge(dog.age),
      fur: this.normalizeFur(dog.fur),
      photo: (await this.classifyImage(dog.photo))[0],
    };
  }
}
