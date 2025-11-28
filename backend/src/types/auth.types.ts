export type RegisterSchema = {
  firstName: string;
  lastName: string;
  gender: string;
  lookingFor: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  iconImage: string;
  photos: string | string[];
  curiousAbout?: number[];
};

