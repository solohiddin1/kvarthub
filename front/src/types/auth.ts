// Authentication types

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone_number?: string;
    is_verified: boolean;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    result: AuthTokens;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name?: string;
    phone_number?: string;
}

export interface RegisterSuccessResponse {
    success: true;
    result: {
        id: string;
        email: string;
        full_name: string;
        phone_number: string;
        is_verified: boolean;
        otp: string;
        send_result: boolean;
    };
}

export interface RegisterErrorResponse {
    success: false;
    error: {
        code: number;
        message: string;
        message_language?: {
            uz: string;
            en: string;
            ru: string;
        };
    };
}

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;


export interface VerifyOtpRequest {
    email: string;
    code: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    result: AuthTokens;
}

export interface UserProfileResponse {
    success: boolean;
    result: User;
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
    };
}

export interface ImageType {
    id:string
  image: string
}

export type ForWhomType = "BOYS" | "GIRLS" | "FAMILY" | "FOREIGNERS";

export interface ProductsType {
  id: number
  title: string
  description: string
  price: string
  location:string
  rating: string
  phone_number:string
  floor_of_this_apartment:number
  total_floor_of_building:number
  images: ImageType[]
  rooms: number
  for_whomdispley:string[]
  district: DistrictType;
  region: RegionsType;
  for_whom: ForWhomType[];
  for_whom_display?: ForWhomType[];
  location_link:string
  is_active?: boolean
}
export interface DistrictType {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  region: number;
  soato_id: number;
}
 

 export interface RegionsType {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  soato_id: number;
  disctricts: DistrictType[]; 
}
export interface PaymenType {
    id: number,
    card_number_last4: string,
    card_holder_name: string,
    expiry_month: number,
    expiry_year: number,
    balance: string,
    is_active: true,
    created_at:string
    updated_at: string
}

export interface ListingImage {
  id: number;
  image: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  location_link?: string | null;
  rooms: number;
  phone_number: string;
  total_floor_of_building: number;
  floor_of_this_apartment: number;
  type?: string;
  region: RegionsType;
  district: DistrictType;
  for_whom_display?: ForWhomType[];
  is_active: boolean;
  images: ListingImage[];
  host?: number;


}
 

export interface Region {
  id: number
  name_uz: string
  name_ru: string
  name_en: string
  soato_id: number
}