import type { Datapack } from "../datapack";
import { NodeRenderer } from "./node-renderer";

export function renderOriginImage(datapack: Datapack, identifier: string) {
    const renderData = datapack.getOriginRenderData(identifier);

    const renderer = new NodeRenderer(renderData);

    return renderer.render();
}

export * from "../";
export * from "./node-renderer";
