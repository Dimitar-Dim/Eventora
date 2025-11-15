import { IUser } from "./user"

export interface ILoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: IUser
}

export interface IRegisterPayload {
  username: string
  email: string
  password: string
  passwordConfirm: string
}
