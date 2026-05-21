export interface Associated {
  id: string;
  name: string;
  type: string;
  dotType: string;
}

export interface SubType {
  subTypeId: string;
  value: string;
}

export interface Brief {
  cover: string;
  name: string;
  description: string | null;
  associate: Associated | null;
  subTypeList: SubType[];
  composite: null;
}

export interface Caption {
  kind: string;
  text: {
    text: string;
  };
}

export interface WikiApiResponse {
  itemId: string;
  name: string;
  lang: string;
  brief: Brief;
  status: number;
  tagIds: string[];
  publishedAtTs: string;
  caption: Caption[];
}
