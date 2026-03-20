export type RegisterSchema = {
  firstName: string;
  lastName: string;
  birthday: string;
  gender: string;
  lookingFor: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  iconUrl: string;
  photoUrls: string | string[];
  curiousAbout?: number[];
};

