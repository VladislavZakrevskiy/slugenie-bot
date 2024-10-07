export interface UserJson {
  preferences?: UserPreferences;
}

export interface UserPreferences {
  breed: Record<string, number>;
  size: Record<string, number>;
  age: Record<string, number>;
  fur: Record<string, number>;
}
