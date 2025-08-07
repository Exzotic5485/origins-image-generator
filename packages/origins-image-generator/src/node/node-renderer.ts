import {
    Canvas,
    GlobalFonts,
    loadImage,
    type SKRSContext2D,
} from "@napi-rs/canvas";
import { BaseRenderer } from "../base-renderer";
import { EMBEDED_ASSETS } from "../constants";
import type { OriginRenderData } from "../types";

type NodeRenderResult = Canvas;

export class NodeRenderer extends BaseRenderer<
    Canvas,
    SKRSContext2D,
    NodeRenderResult
> {
    constructor(renderData: OriginRenderData, canvas?: Canvas) {
        if (!canvas) {
            canvas = new Canvas(
                NodeRenderer.BASE_WIDTH,
                NodeRenderer.BASE_HEIGHT
            );
        }

        super(canvas, renderData);
    }

    createRenderResult(): NodeRenderResult {
        return this.canvas;
    }

    async loadFonts() {
        const dataURIToBuffer = (dataURI: string) => {
            const [, base64] = dataURI.split("base64,");

            if (!base64)
                throw new Error(
                    "Unable to extract base64 string from data uri"
                );

            return Buffer.from(base64, "base64");
        };

        GlobalFonts.register(
            dataURIToBuffer(EMBEDED_ASSETS.MINECRAFT_FONT),
            "Minecraft"
        );
    }

    async loadAndDrawImage(
        src: string,
        dx: number,
        dy: number,
        dw: number,
        dh: number
    ) {
        const image = await loadImage(src);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(image, dx, dy, dw, dh);
    }

    override applyTextShadow() {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowOffsetX = 3 / this.xyScale;
        this.ctx.shadowOffsetY = 3 / this.xyScale;
        this.ctx.shadowBlur = 0;
    }
}
