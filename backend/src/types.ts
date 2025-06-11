import '@hapi/hapi'; // important to import the module for augmentation

declare module '@hapi/hapi' {
  interface Request {
    user?: {
      userId: number;
      role: number;
    };
  }
}

export interface AuthPayload {
    userId: number;
    role: number;
  }
export  interface JwtPayload {
    userId: number;
    email: string;
    role: string;
    [key: string]: unknown;
  }
  export interface Role {
    id: number;
    name: string;
  }
  
  export interface User {
    id: number;
    email: string;
    role: Role;
    // add other properties as needed
  }
  export enum Gender {
    Male = 'male',
    Female = 'female',
  }
  