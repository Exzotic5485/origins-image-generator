export type Origin = {
    name?: TextComponent | TextComponent[];
    description?: TextComponent | TextComponent[];
    impact?: number;
    icon?: Icon;
    powers?: string[];
};

export type Power = {
    name?: TextComponent | TextComponent[];
    description?: TextComponent | TextComponent[];
    hidden?: boolean;
    badges?: (string | Badge)[];
};

export type Badge = {
    type: string;
    sprite: string;
    text?: string;
};

export type OriginRenderData = {
    origin: Origin;
    powers: Power[];
    badges: Badge[];
};

export type TextComponent =
    | string
    | {
          text: string;
          color?: string;
          bold?: boolean;
          italic?: boolean;
          strikethrough?: boolean;
          underlined?: boolean;
          obfuscated?: boolean;
      };

export type Icon = string | { id?: string; item?: string };

export enum DatapackParseErrorType {
    ORIGIN = "ORIGIN",
    POWER = "POWER",
    BADGE = "BADGE",
}

export type DatapackParseError = {
    type: DatapackParseErrorType;
    filePath: string;
    error: string;
    identifier: string;
};

export type RenderConfig = {
    showBadges?: boolean;
};
