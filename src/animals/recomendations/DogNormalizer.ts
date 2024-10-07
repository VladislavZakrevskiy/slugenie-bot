import { levenshtein } from 'src/core/helpers/levenshtein';
import { DogApiService } from '../../dog_api/dog_api.service';
import { CreateDogDto } from 'src/animals/dto/AnimalVectorDto';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Jimp } from 'jimp';

export class DogNormalizer {
  constructor(private dogApiService: DogApiService) {}

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
    const breeds = await this.dogApiService.getBreeds();
    return this.findClosestBreed(breeds, inputBreed);
  }

  async loadModel() {
    const model = await mobilenet.load();
    return model;
  }

  async loadImage(imagePath: string) {
    const image = await Jimp.read(imagePath);
    const { data, width, height } = image.bitmap;
    const imageTensor = tf.tensor3d(new Uint8Array(data), [height, width, 4]); // RGBA
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

  public async normalize(dog: CreateDogDto) {
    return {
      breed: await this.normalizeBreed(dog.breed),
      size: dog.size,
      age: dog.age,
      fur: dog.fur,
      photo: await this.classifyImage(dog.photo),
    };
  }
}
