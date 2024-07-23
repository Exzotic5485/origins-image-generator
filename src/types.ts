type TextComponent = string | {
    text: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underlined?: boolean;
    obfuscated?: boolean;
}
type OriginData = {
    identifier: string;
    name?: TextComponent | TextComponent[];
    description?: TextComponent | TextComponent[];
    impact?: number;
    icon?: string | {
        item: string;
    };
    powers?: string[];
}

type RenderableOrigin = Omit<OriginData, "powers"> & {
    powers: PowerData[];
}

interface PowerData {
    name?: TextComponent | TextComponent[];
    description?: TextComponent | TextComponent[];
    hidden?: boolean;
    badges?: {
        sprite: string;
    }[];
}