export type FormState = {
  success: boolean;
  message: string;
};

export enum ProviderTypes {
  GOOGLE = 'google',
  GITHUB = 'github',
  AZURE = 'azure',
}
