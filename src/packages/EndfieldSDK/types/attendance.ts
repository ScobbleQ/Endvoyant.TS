/** Skport Zonai (`zonai.skport.com`) — `message` / `code` / `timestamp` */
interface SkportResponseBase {
  code: number;
  message: string;
  timestamp: number;
}

export interface SigninResponse extends SkportResponseBase {
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
