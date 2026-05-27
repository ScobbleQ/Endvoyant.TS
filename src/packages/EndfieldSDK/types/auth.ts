/** Gryphline AS (`as.gryphline.com`) — `msg` / `status` / `type` */
interface GryphlineResponseBase {
  msg: string;
  status: number;
  type: string;
}

/** Skport Zonai (`zonai.skport.com`) — `message` / `code` / `timestamp` */
interface SkportZonaiResponseBase {
  code: number;
  message: string;
  timestamp: number;
}

export type EmailPasswordLoginData = {
  token: string;
  hgId: string;
  email: string;
  isLatestUserAgreement: boolean;
};

export interface EmailPasswordLoginResponse extends GryphlineResponseBase {
  data: EmailPasswordLoginData;
  status: 0;
}

export interface GryphlineErrorResponse extends GryphlineResponseBase {
  status: 1 | 104;
}

// 1 = VerificationRequired
// 104 = IncorrectEmailOrPassword

export interface ChannelTokenAuthResponse extends GryphlineResponseBase {
  status: 0;
  data: {
    token: string;
    isNew: boolean;
    uid: string;
  };
}

/** OAuth2 grant mode: `0` = authorization code, `1` = token */
export type OAuth2GrantKind = 0 | 1;

export interface OAuth2CodeGrantResponse extends GryphlineResponseBase {
  status: 0;
  data: {
    uid: string;
    code: string;
  };
}

export interface OAuth2TokenGrantResponse extends GryphlineResponseBase {
  status: 0;
  data: {
    token: string;
    hgId: string;
  };
}

export type OAuth2GrantByKind<T extends OAuth2GrantKind> = T extends 0
  ? OAuth2CodeGrantResponse
  : OAuth2TokenGrantResponse;

export interface SkportZonaiErrorResponse extends SkportZonaiResponseBase {
  code: 10002;
}

// 10002 = ExpiredOAuthCode

export interface CredentialsFromCodeResponse extends SkportZonaiResponseBase {
  code: 0;
  data: {
    cred: string;
    userId: string;
    token: string;
  };
}

export interface RefreshAccountTokenResponse extends SkportZonaiResponseBase {
  code: 0;
  data: {
    token: string;
  };
}

export interface PlayerBindingsResponse extends SkportZonaiResponseBase {
  code: 0;
  data: {
    list: {
      appCode: string;
      appName: string;
      bindingList: {
        uid: string;
        isOfficial: boolean;
        isDefault: boolean;
        channelMasterId: string;
        channelName: string;
        nickName: string;
        isDelete: string;
        gameName: string;
        gameId: number;
        roles: {
          serverId: string;
          roleId: string;
          nickname: string;
          level: number;
          isDefault: boolean;
          isBanned: boolean;
          serverType: string;
          serverName: string;
        }[];
        defaultRole: {
          serverId: string;
          roleId: string;
          nickname: string;
          level: number;
          isDefault: boolean;
          isBanned: boolean;
          serverType: string;
          serverName: string;
        };
      }[];
    }[];
    serverDefaultBinding: {};
  };
}
