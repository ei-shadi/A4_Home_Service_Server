export interface IRegisterUserPayload {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: string;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}