import type { Datapack } from "../datapack";
import type { RenderConfig } from "../types";
import { NodeRenderer } from "./node-renderer";

export function renderOriginImage(
    datapack: Datapack,
    identifier: string,
    config?: RenderConfig
) {
    const renderData = datapack.getOriginRenderData(identifier);

    const renderer = new NodeRenderer(renderData, undefined, config);

    return renderer.render();
}

export * from "../";
export * from "./node-renderer";
