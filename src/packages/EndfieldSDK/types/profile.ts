export interface KeyValue {
  key: string;
  value: string;
}

export interface Base {
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
}

export interface SuitData {
  id: string;
  name: string;
  skillId: string;
  skillDesc: string;
  skillDescParams: Record<string, string>;
}

export interface CharacterEquipmentData {
  id: string;
  name: string;
  iconUrl: string;
  rarity: KeyValue;
  type: KeyValue;
  level: KeyValue;
  properties: string[];
  isAccessory: boolean;
  suit: SuitData;
  function: string;
  pkg: string;
}

export interface CharacterEquipment {
  equipId: string;
  equipData: CharacterEquipmentData;
}

export interface TacticalItemData {
  id: string;
  name: string;
  iconUrl: string;
  rarity: KeyValue;
  activeEffectType: KeyValue;
  activeEffect: string;
  passiveEffect: string;
  activeEffectParams: Record<string, string>;
  passiveEffectParams: Record<string, string>;
}

export interface TacticalItem {
  tacticalItemId: string;
  tacticalItemData: TacticalItemData;
}

export interface UserSkillData {
  skillId: string;
  level: number;
  maxLevel: number;
}

export interface SkillLevelParams {
  level: string;
  params: Record<string, string>;
}

export interface SkillData {
  id: string;
  name: string;
  type: KeyValue;
  property: KeyValue;
  iconUrl: string;
  desc: string;
  descParams: Record<string, string>;
  descLevelParams: Record<string, SkillLevelParams>;
}

export interface CharacterData {
  id: string;
  name: string;
  avatarSqUrl: string;
  avatarRtUrl: string;
  rarity: KeyValue;
  profession: KeyValue;
  property: KeyValue;
  weaponType: KeyValue;
  skills: SkillData[];
  illustrationUrl: string;
  tags: string[];
}

export interface WeaponData {
  id: string;
  name: string;
  iconUrl: string;
  rarity: KeyValue;
  type: KeyValue;
  function: string;
  description: string;
  skills: KeyValue[];
}

export interface Weapon {
  weaponData: WeaponData;
  level: number;
  refineLevel: number;
  breakthroughLevel: number;
  gem: null;
}

export interface Characters {
  charData: CharacterData;
  id: string;
  level: number;
  userSkills: Record<string, UserSkillData>;
  bodyEquip: CharacterEquipment | null;
  armEquip: CharacterEquipment | null;
  firstAccessory: CharacterEquipment | null;
  secondAccessory: CharacterEquipment | null;
  tacticalItem: TacticalItem | null;
  evolvePhase: number;
  potentialLevel: number;
  weapon: Weapon | null;
  gender: string;
  ownTs: string;
}

export interface AchievementMedal {
  achievementData: Record<string, unknown>;
  level: number;
  isPlated: boolean;
  obtainTs: string;
}

export interface SpaceShipRoomReport {
  char: unknown[];
  output: Record<string, unknown>;
  createdTimeTs: string;
}

export interface SpaceShipRoom {
  id: string;
  type: number;
  level: number;
  chars: unknown[];
  reports: Record<string, SpaceShipRoomReport>;
}

export interface Settlement {
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
}

export interface DomainCollection {
  levelId: string;
  puzzleCount: number;
  trchestCount: number;
  equipTrchestCount: number;
  pieceCount: number;
  blackboxCount: number;
}

export interface DomainCount {
  count: number;
  total: number;
}

export interface DomainLevel {
  levelId: string;
  name: string;
  puzzleCount: DomainCount;
  trchestCount: DomainCount;
  equipTrchestCount: DomainCount;
  pieceCount: DomainCount;
  blackboxCount: DomainCount;
}

export interface Domain {
  domainId: string;
  level: number;
  settlements: Settlement[];
  moneyMgr: {
    total: string;
    count: string;
  };
  collections: DomainCollection[];
  levels: DomainLevel[];
  factory: null;
  name: string;
}

export interface PlayerRole {
  serverId: string;
  roleId: string;
  nickname: string;
  level: number;
  isDefault: boolean;
  isBanned: boolean;
  serverType: string;
  serverName: string;
}

export interface PlayerBindingList {
  uid: string;
  isOfficial: boolean;
  isDefault: boolean;
  channelMasterId: string;
  channelName: string;
  isDelete: boolean;
  gameName: string;
  gameId: number;
  roles: PlayerRole[];
  defaultRole: PlayerRole;
}

export interface PlayerBinding {
  appCode: string;
  appName: string;
  supportMultiServer: boolean;
  bindingList: PlayerBindingList[];
}

export interface AccountRole {
  isBind: boolean;
  serverId: string;
  serverName: string;
  roleId: string;
  nickName: string;
  level: number;
  isDefault: boolean;
  registerTs: number;
}

export interface AccountBindingList {
  uid: string;
  channelMasterId: string;
  channelName: string;
  isDelete: boolean;
  isBanned: boolean;
  registerTs: number;
  roles: AccountRole[];
}

export interface AccountBinding {
  appCode: string;
  appName: string;
  supportMultiServer: boolean;
  bindingList: AccountBindingList[];
}

export interface AwardIds {
  id: string;
  type: string;
}

export interface ResourceItem {
  id: string;
  count: number;
  name: string;
  icon: string;
}

export interface AttendanceResponse {
  ts: string;
  awardIds: AwardIds[];
  resourceInfoMap: Record<string, ResourceItem>;
}

export interface CardDetail {
  base: Base;
  chars: Characters[];
  achieve: {
    achieveMedals: AchievementMedal[];
    display: Record<string, string>;
    count: number;
  };
  spaceShip: {
    rooms: SpaceShipRoom[];
  };
  domain: Domain[];
  dungeon: {
    curStamina: string;
    maxTs: string;
    maxStamina: string;
  };
  bpSystem: {
    curLevel: number;
    maxLevel: number;
  };
  dailyMission: {
    dailyActivation: number;
    maxDailyActivation: number;
  };
  weeklyMission: {
    score: number;
    total: number;
  };
  config: {
    charSwitch: boolean;
    charIds: string[];
  };
  currentTs: string;
}
