import { Animal } from '@prisma/client';
import { UserPreferences } from 'src/users/types/UserJson';

export class DogRecommender {
  private calculateScore(dog: Animal, preferences: UserPreferences): number {
    let score = 0;
    score += preferences.breed[dog.breed] || 0;
    score += preferences.size[dog.size] || 0;
    score += preferences.age[dog.age] || 0;
    score += preferences.fur[dog.fur] || 0;

    return score;
  }

  public recommend(dogs: Animal[], userPreferences: UserPreferences): Animal[] {
    return dogs
      .map((dog) => ({ dog, score: this.calculateScore(dog, userPreferences) }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.dog);
  }
}
