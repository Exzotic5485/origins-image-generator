import { MC_ASSETS_LOCATION, ORIGINS_ASSETS_LOCATION } from "./constants";
import type { Icon, TextComponent } from "./types";

export function getItemIconURL(icon?: Icon): string {
    const iconItem = typeof icon === "string" ? icon : icon?.id ?? icon?.item;

    if (!iconItem) return getItemIconURL("minecraft:stone");

    let [namespace, path] = iconItem.split(":");

    if (!path) {
        path = namespace;
        namespace = "minecraft";
    }

    if (!["minecraft", "origins"].includes(namespace!)) {
        console.log(`Unknown icon: ${icon}`);

        namespace = "minecraft";
        path = "stone";
    }

    return `${MC_ASSETS_LOCATION}/${namespace}/${path}.png`;
}

export function getBadgeSpriteUrl(sprite: string) {
    const [namespace, path] = sprite.split(":");

    if (!path) return getItemIconURL("minecraft:stone"); // maybe throw an error instead?

    if (namespace == "origins") return ORIGINS_ASSETS_LOCATION + path;

    const matchItemOrBlockTexture = path.match(
        /textures\/(item|block)\/(.*).png/
    );

    if (!matchItemOrBlockTexture) return getItemIconURL("minecraft:stone");

    return getItemIconURL(
        matchItemOrBlockTexture
            ? `minecraft:${matchItemOrBlockTexture[2]}`
            : "minecraft:stone"
    );
}

function removeFormattingCharacters(text: string) {
    return text.replace(/[&§][0-9a-u]/g, "");
}

function textComponentToString(textComponent: TextComponent | TextComponent[]) {
    return typeof textComponent === "string"
        ? textComponent
        : Array.isArray(textComponent)
        ? textComponent.join("")
        : "";
}

// Temporary until I add text component styling
export function fixTextComponent(
    textComponent?: TextComponent | TextComponent[]
) {
    return textComponent
        ? removeFormattingCharacters(textComponentToString(textComponent))
        : "";
}
