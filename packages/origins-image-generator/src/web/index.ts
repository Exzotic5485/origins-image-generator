import type { Datapack } from "../datapack";
import type { RenderConfig } from "../types";
import { WebRenderer } from "./web-renderer";

export async function renderOriginImage(
    datapack: Datapack,
    identifier: string,
    config?: RenderConfig
) {
    const renderData = datapack.getOriginRenderData(identifier);

    const renderer = new WebRenderer(renderData, undefined, config);

    return renderer.render();
}

export * from "../";
export * from "./web-renderer";
