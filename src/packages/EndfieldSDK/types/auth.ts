interface AsResponseBase {
  msg: string;
  status: number;
  type: string;
}

export type TokenByEmailPasswordResponseData = {
  token: string;
  hgId: string;
  email: string;
  isLatestUserAgreement: boolean;
};

export interface TokenByEmailPasswordResponse extends AsResponseBase {
  data: TokenByEmailPasswordResponseData;
  status: 0;
}

export interface ErrorResponse extends AsResponseBase {
  status: 1 | 104;
}

// 1 = VerificationRequired
// 104 = IncorrectEmailOrPassword

interface ZonaiResponseBase {
  code: number;
  message: string;
  timestamp: number;
}

export type SkportOAuthCodeGrant = {
  uid: string;
  code: string;
};

export type SkportOAuthTokenGrant = {
  token: string;
  hgId: string;
};

export interface OAuth2GrantResponse extends AsResponseBase {
  data: SkportOAuthCodeGrant | SkportOAuthTokenGrant;
  status: 0;
}

export interface ZonaiErrorResponse extends ZonaiResponseBase {
  code: 10002;
}

// 10002 = ExpiredOAuthCode
