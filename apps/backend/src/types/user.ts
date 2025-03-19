type Gender = {
  id: string;
  name: string;
};

type Pronounce = {
  id: string;
  name: string;
};

type PublicPicture = {
  id: string;
  url: string;
};

type PrivatePicture = {
  id: string;
  url: string;
};

type User = {
  id: string;
  email: string;
  password: string;
  publicPictures: PublicPicture[];
  privatePictures: PrivatePicture[];
  name: string;
  age: number;
  height: number;
  weight: number;
  genders: Gender;
  pronounces: Pronounce;
  bio: string;
  location: string;
  premium: boolean;
  createdAt: string;
  updatedAt: string;
};

type TestUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  age: number;
  createdAt: string;
  updatedAt: string;
};

export { User, TestUser };
