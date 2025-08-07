import type { Datapack } from "../datapack";
import { WebRenderer } from "./web-renderer";

export async function renderOriginImage(
    datapack: Datapack,
    identifier: string
) {
    const renderData = datapack.getOriginRenderData(identifier);

    const renderer = new WebRenderer(renderData);

    return renderer.render();
}

export * from "../";
export * from "./web-renderer";
