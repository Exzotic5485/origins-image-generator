import { BaseRenderer } from "../base-renderer";
import { EMBEDED_ASSETS } from "../constants";
import type { OriginRenderData, RenderConfig } from "../types";

type WebRenderResult = {
    blob(type?: string, quality?: number): Promise<Blob | null>;
    canvas(): HTMLCanvasElement;
    dataURL(): string;
};

export class WebRenderer extends BaseRenderer<
    HTMLCanvasElement,
    CanvasRenderingContext2D,
    WebRenderResult
> {
    private readonly imageCache = new Map<string, HTMLImageElement>();

    constructor(renderData: OriginRenderData, canvas?: HTMLCanvasElement, config?: RenderConfig) {
        if (!canvas) {
            canvas = document.createElement("canvas");
        }

        super(canvas, renderData, config);
    }

    createRenderResult(): WebRenderResult {
        return {
            canvas: () => this.canvas,
            dataURL: () => this.canvas.toDataURL(),
            blob: (type?: string, quality?: number) => {
                return new Promise((resolve) => {
                    this.canvas.toBlob(
                        (blob) => {
                            resolve(blob);
                        },
                        type,
                        quality
                    );
                });
            },
        };
    }

    loadFonts(): Promise<void> {
        return this.loadFont(
            "Minecraft",
            `url('${EMBEDED_ASSETS.MINECRAFT_FONT}')`
        );
    }

    async loadFont(family: string, source: string) {
        const fontFace = new FontFace(family, source);

        await fontFace.load();

        document.fonts.add(fontFace);
    }

    async loadAndDrawImage(
        src: string,
        dx: number,
        dy: number,
        dw: number,
        dh: number
    ) {
        const image = await this.loadImage(src);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(image, dx, dy, dw, dh);
    }

    async loadImage(imageSource: string) {
        if (this.imageCache.has(imageSource)) {
            return this.imageCache.get(imageSource)!;
        }

        return new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = imageSource;

            image.onload = () => {
                this.imageCache.set(imageSource, image);

                resolve(image);
            };

            image.onerror = () => {
                reject(`Failed to load image: ${imageSource}.`);
            };
        });
    }
}
