type OriginData = {
    identifier: string;
    name?: string;
    description?: string;
    impact?: "low" | "medium" | "high" | "none";
    icon?: string | {
        item: string;
    };
    powers?: string[];
}

type RenderableOrigin = Omit<OriginData, "powers"> & {
    powers: PowerData[];
}

interface PowerData {
    name?: string;
    description?: string;
    hidden?: boolean;
    badges?: string[];
}