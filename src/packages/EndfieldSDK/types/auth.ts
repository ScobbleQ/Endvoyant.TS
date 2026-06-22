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
  code: 10002 | 10001;
}

// 10002 = ExpiredOAuthCode
// 10001 = AlreadySignedIn

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
    acw_tc: string;
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

export interface SigninResponse extends SkportZonaiResponseBase {
  code: 0;
  data: {
    ts: string;
    awardIds: { id: string; type: number }[];
    resourceInfoMap: {
      [key: string]: {
        id: string;
        count: number;
        name: string;
        icon: string;
      };
    };
    tomorrowAwardIds: { id: string; type: number }[];
  };
}

export interface CardDetailResponse extends SkportZonaiResponseBase {
  code: 0;
  data: {
    detail: {
      base: {
        serverName: string;
        roleId: string;
        name: string;
        createTime: string;
        saveTime: string;
        lastLoginTime: string;
        exp: number;
        level: number;
        worldLevel: number;
        gender: number;
        avatarUrl: string;
        mainMission: {
          id: string;
          description: string;
        };
        charNum: number;
        weaponNum: number;
        docNum: number;
      };
      chars: {
        charData: {
          id: string;
          name: string;
          avatarSqUrl: string;
          avatarRtUrl: string;
          rarity: {
            key: string;
            value: string;
          };
          profession: {
            key: string;
            value: string;
          };
          property: {
            key: string;
            value: string;
          };
          weaponType: {
            key: string;
            value: string;
          };
          skills: {
            id: string;
            name: string;
            type: {
              key: string;
              value: string;
            };
            property: {
              key: string;
              value: string;
            };
            iconUrl: string;
            desc: string;
            descParams: {
              [key: string]: string;
            };
            descLevelParams: {
              [key: string]: {
                level: string;
                params: {
                  [key: string]: string;
                };
              };
            };
          }[];
          illustrationUrl: string;
          tags: string[];
          abilityTalents: {
            id: string;
            name: string;
            iconUrl: string;
            desc: string;
            descParams: {
              [key: string]: string;
            };
            lockedIconUrl: string;
          }[];
          combatTalents: {
            id: string;
            name: string;
            iconUrl: string;
            desc: string;
            descParams: {
              [key: string]: string;
            };
            lockedIconUrl: string;
          }[];
          cultivationTalents: {
            id: string;
            name: string;
            iconUrl: string;
            desc: string;
            descParams: {
              [key: string]: string;
            };
            lockedIconUrl: string;
          }[];
        };
        id: string;
        level: number;
        userSkills: {
          [key: string]: {
            skillId: string;
            level: number;
            maxLevel: number;
          };
        };
        bodyEquip?: {
          equipId: string;
          equipData: {
            id: string;
            name: string;
            iconUrl: string;
            rarity: {
              key: string;
              value: string;
            };
            type: {
              key: string;
              value: string;
            };
            level: {
              key: string;
              value: string;
            };
            properties: string[];
            isAccessory: boolean;
            suit: {
              id: string;
              name: string;
              skillId: string;
              skillDesc: string;
              skillDescParams: {
                [key: string]: string;
              };
            };
            function: string;
            pkg: string;
          };
        };
        armEquip?: {
          equipId: string;
          equipData: {
            id: string;
            name: string;
            iconUrl: string;
            rarity: {
              key: string;
              value: string;
            };
            type: {
              key: string;
              value: string;
            };
            level: {
              key: string;
              value: string;
            };
            properties: string[];
            isAccessory: boolean;
            suit: {
              id: string;
              name: string;
              skillId: string;
              skillDesc: string;
              skillDescParams: {
                [key: string]: string;
              };
            };
            function: string;
            pkg: string;
          };
        };
        firstAccessory?: {
          equipId: string;
          equipData: {
            id: string;
            name: string;
            iconUrl: string;
            rarity: {
              key: string;
              value: string;
            };
            type: {
              key: string;
              value: string;
            };
            level: {
              key: string;
              value: string;
            };
            properties: string[];
            isAccessory: boolean;
            suit: {
              id: string;
              name: string;
              skillId: string;
              skillDesc: string;
              skillDescParams: {
                [key: string]: string;
              };
            };
            function: string;
            pkg: string;
          };
        };
        secondAccessory?: {
          equipId: string;
          equipData: {
            id: string;
            name: string;
            iconUrl: string;
            rarity: {
              key: string;
              value: string;
            };
            type: {
              key: string;
              value: string;
            };
            level: {
              key: string;
              value: string;
            };
            properties: string[];
            isAccessory: boolean;
            suit: {
              id: string;
              name: string;
              skillId: string;
              skillDesc: string;
              skillDescParams: {
                [key: string]: string;
              };
            };
            function: string;
            pkg: string;
          };
        };
        tacticalItem: {
          tacticalItemId: string;
          tacticalItemData: {
            id: string;
            name: string;
            iconUrl: string;
            rarity: {
              key: string;
              value: string;
            };
            activeEffectType: {
              key: string;
              value: string;
            };
            activeEffect: string;
            passiveEffect: string;
            activeEffectParams: {
              [key: string]: string;
            };
            passiveEffectParams: {
              [key: string]: string;
            };
          };
        };
        evolvePhase: number;
        potentialLevel: number;
        weapon: {
          weaponData: {
            id: string;
            name: string;
            iconUrl: string;
            rarity: {
              key: string;
              value: string;
            };
            type: {
              key: string;
              value: string;
            };
            function: string;
            description: string;
            skills: {
              key: string;
              value: string;
            }[];
          };
          level: number;
          refineLevel: number;
          breakthroughLevel: number;
          gem: null | {
            id: string;
            icon: string;
            gemData: {
              termId: string;
              name: string;
              icon: string;
              templateId: string;
            };
          };
          wikiItemId: string;
        };
        gender: string;
        ownTs: string;
        wikiItemId: string;
        talent: {
          latestBreakNode: string;
          attrNodes: string[];
          latestPassiveSkillNodes: string[];
          latestFactorySkillNodes: string[];
          latestSpaceshipSkillNodes: string[];
        };
      }[];
      achieve: {
        achieveMedals: {
          achievementData: {
            id: string;
            name: string;
            initIcon: string;
            reforge2Icon: string;
            reforge3Icon: string;
            platedIcon: string;
            cateName: string;
            canCertify: boolean;
            cate: string;
            initLevel: number;
          };
          level: number;
          isPlated: boolean;
          obtainTs: string;
        }[];
        display: {
          [key: string]: string;
        };
        count: number;
      };
      spaceShip: {
        rooms: {
          id: string;
          type: number;
          level: number;
          chars: {
            charId: string;
            physicalStrength: number;
            favorability: number;
            avatarUrl: string;
          }[];
          reports: {};
        }[];
      };
      domain: {
        domainId: string;
        level: number;
        settlements: {
          id: string;
          level: number;
          exp: string;
          expToLevelUp: string;
          remainMoney: string;
          moneyMax: string;
          officerCharIds: string;
          officerCharAvatar: string;
          name: string;
          lastTickTime: string;
          isFinalMaxLevel: boolean;
        }[];
        moneyMgr: {
          total: string;
          count: string;
        };
        collections: {
          levelId: string;
          puzzleCount: number;
          trchestCount: number;
          equipTrchestCount: number;
          pieceCount: number;
          blackboxCount: number;
        }[];
        levels: {
          levelId: string;
          name: string;
          puzzleCount: { count: number; total: number };
          trchestCount: { count: number; total: number };
          equipTrchestCount: { count: number; total: number };
          pieceCount: { count: number; total: number };
          blackboxCount: { count: number; total: number };
        }[];
        factory: null;
        name: string;
      }[];
      dungeon: { curStamina: string; maxTs: string; maxStamina: string };
      bpSystem: { curLevel: number; maxLevel: number };
      dailyMission: { dailyActivation: number; maxDailyActivation: number };
      weeklyMission: { score: number; total: number };
      config: {
        charSwitch: boolean;
        standingsSwitch: boolean;
        charIds: string[];
      };
      currentTs: string;
      quickaccess: {
        name: string;
        icon: string;
        link: string;
      }[];
      indieHard: {
        indieHardGroups: {
          id: string;
          name: string;
          pic: string;
          dungeonGroups: {
            normalDungeon: {
              id: string;
              name: string;
              isPass: boolean;
            };
            hardDungeon: {
              id: string;
              name: string;
              isPass: boolean;
            };
          }[];
          activityStartTs: string;
          activityEndTs: string;
          activityName: string;
          isInActivity: boolean;
        }[];
      };
      seekSuspicion: { count: number; total: number };
      crisisContract: {
        id: string;
        highest: number;
        challengeCount: number;
        achieve: {
          achievementData: {
            id: string;
            name: string;
            initIcon: string;
            reforge2Icon: string;
            reforge3Icon: string;
            platedIcon: string;
            cateName: string;
            canCertify: boolean;
            cate: string;
            initLevel: number;
          };
          level: number;
          isPlated: boolean;
          obtainTs: string;
        };
        weeklyMission: { count: number; total: number };
        indicatorMission: { count: number; total: number };
        stageMission: { count: number; total: number };
        name: string;
        kvImage: string;
        startAtTs: string;
        endAtTs: string;
        gameplayEndAtTs: string;
        headerImage: string;
      }[];
    };
  };
}
