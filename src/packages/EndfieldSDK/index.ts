import { EndfieldSDK } from "./client.ts";

export { EndfieldSDK } from "./client.ts";
export type {
  CredentialsFromCodeResponse,
  EmailPasswordLoginResponse,
  GryphlineErrorResponse,
  OAuth2GrantByKind,
  PlayerBindingsResponse,
  SigninResponse,
  SkportZonaiErrorResponse,
} from "./types/auth.ts";

const sdk = new EndfieldSDK();
export default sdk;
