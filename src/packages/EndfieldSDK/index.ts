import { EndfieldSDK } from "./client.ts";

export { EndfieldSDK } from "./client.ts";
export type {
  CredentialsFromCodeResponse,
  EmailPasswordLoginResponse,
  GryphlineErrorResponse,
  OAuth2GrantByKind,
  PlayerBindingsResponse,
  SkportZonaiErrorResponse,
  SigninResponse,
} from "./types/auth.ts";

const sdk = new EndfieldSDK();
export default sdk;
