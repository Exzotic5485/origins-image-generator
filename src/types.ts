type TextComponent =
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

type OriginData = {
    identifier: string;
    name?: TextComponent | TextComponent[];
    description?: TextComponent | TextComponent[];
    impact?: number;
    icon?:
        | string
        | {
              item: string;
          };
    powers?: string[];
};

type RenderableOrigin = Omit<OriginData, "powers"> & {
    powers: RenderablePower[];
};

type PowerData = {
    name?: TextComponent | TextComponent[];
    description?: TextComponent | TextComponent[];
    hidden?: boolean;
    badges?: (string | BadgeData)[];
};

type RenderablePower = Omit<PowerData, "badges"> & {
    badges: BadgeData[];
};

type BadgeData = {
    type: string;
    sprite: string;
    text?: string;
};
