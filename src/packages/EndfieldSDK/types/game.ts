export interface Bulletin {
  channel: string;
  key: string;
  lang: string;
  onlineList: {
    cid: string;
    needPopup: boolean;
    needRedDot: boolean;
    version: number;
  }[];
  platform: string;
  server: string;
  subChannel: string;
  topicCid: string;
  type: number;
  updatedAt: number;
  version: string;
}

export interface BulletinDetail {
  cid: string;
  data: {
    html: string;
    linkType: number;
  };
  header: string;
  startAt: number;
  tab: string;
  title: string;
  type: number;
  version: string;
}

export interface CachedBulletinEvent {
  cid: string;
  tab: "events" | "updates" | "news";
  header: string;
  html: string;
  linkType: number;
  title: string;
  startAt: number;
  version: string;
  onlineVersion?: number;
  topicCid?: string;
  topicKey?: string;
}
