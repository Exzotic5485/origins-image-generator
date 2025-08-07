import type { Canvas, SKRSContext2D } from "@napi-rs/canvas";
import { EMBEDED_ASSETS, IMPACT_LEVELS } from "./constants";
import type { OriginRenderData, RenderConfig } from "./types";
import { fixTextComponent, getBadgeSpriteUrl, getItemIconURL } from "./utils";

export abstract class BaseRenderer<
    TCanvas extends HTMLCanvasElement | Canvas,
    TCTX extends CanvasRenderingContext2D | SKRSContext2D,
    TRenderResult = {}
> {
    readonly canvas: TCanvas;
    readonly ctx: TCTX;
    readonly renderData: OriginRenderData;

    static readonly BASE_WIDTH = 176;
    static readonly BASE_HEIGHT = 200;

    readonly xyScale = 4;

    protected endY = 0;

    protected config: RenderConfig;

    constructor(
        canvas: TCanvas,
        renderData: OriginRenderData,
        config?: RenderConfig
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")! as TCTX;
        this.renderData = renderData;
        this.config = config ?? {};

        this.canvas.width = BaseRenderer.BASE_WIDTH * this.xyScale;
        this.canvas.height = BaseRenderer.BASE_HEIGHT * this.xyScale;

        this.scale();
    }

    abstract createRenderResult(): TRenderResult;

    abstract loadAndDrawImage(
        src: string,
        dx: number,
        dy: number,
        dw: number,
        dh: number
    ): Promise<void>;

    abstract loadFonts(): Promise<void>;

    async render(): Promise<TRenderResult> {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        await this.loadFonts();

        const containerEnd = this.calculateContentEnd();

        this.endY = containerEnd;

        if (this.endY * this.xyScale > this.canvas.height) {
            this.canvas.height =
                this.canvas.height +
                (this.endY * this.xyScale - this.canvas.height);

            this.scale();
        }

        this.ctx.fillStyle = "#555555";
        this.ctx.fillRect(0, 8, BaseRenderer.BASE_WIDTH, this.endY - 16);

        await this.renderOriginContainer();

        return this.createRenderResult();
    }

    protected calculateContentEnd() {
        const textWidthLimit = BaseRenderer.BASE_WIDTH - 48;
        let y = 57;

        y +=
            this.wrapText(
                fixTextComponent(this.renderData.origin.description),
                textWidthLimit
            ).length *
                12 +
            12;

        for (const power of this.renderData.powers) {
            if (power.hidden) continue;

            const powerNameLines = this.wrapText(
                fixTextComponent(power.name),
                textWidthLimit
            );
            const powerDescriptionLines = this.wrapText(
                fixTextComponent(power.description),
                textWidthLimit
            );

            const requiredHeight =
                powerNameLines.length * 12 -
                12 +
                powerDescriptionLines.length * 12 +
                20;

            y += requiredHeight;
        }

        return y;
    }

    protected async renderOriginContainer() {
        await this.loadAndDrawImage(
            EMBEDED_ASSETS.BORDER_START,
            0,
            0,
            BaseRenderer.BASE_WIDTH,
            10
        );

        await this.loadAndDrawImage(EMBEDED_ASSETS.NAME_PLATE, 10, 10, 150, 26);

        await this.loadAndDrawImage(
            EMBEDED_ASSETS[
                `IMPACT_${IMPACT_LEVELS[this.renderData.origin.impact || 0]!}`
            ],
            128,
            19,
            28,
            8
        );

        await this.loadAndDrawImage(
            getItemIconURL(this.renderData.origin.icon),
            15,
            15,
            16,
            16
        );

        this.drawTextWithShadow(
            fixTextComponent(this.renderData.origin.name),
            39,
            26,
            BaseRenderer.BASE_WIDTH - (62 + 3 * 8)
        );

        await this.renderOriginContent();

        await this.loadAndDrawImage(
            EMBEDED_ASSETS.BORDER_SIDES,
            0,
            10,
            BaseRenderer.BASE_WIDTH,
            this.endY - 20
        );

        await this.loadAndDrawImage(
            EMBEDED_ASSETS.BORDER_END,
            0,
            this.endY - 10,
            BaseRenderer.BASE_WIDTH,
            10
        );
    }

    protected async renderOriginContent() {
        const textWidthLimit = BaseRenderer.BASE_WIDTH - 48;

        let x = 18;
        let y = 57;

        for (const descriptionLine of this.wrapText(
            fixTextComponent(this.renderData.origin.description),
            textWidthLimit
        )) {
            this.drawTextWithShadow(descriptionLine, x + 2, y, textWidthLimit, {
                fillStyle: "#CCCCCC",
            });

            y += 12;
        }

        y += 12;

        for (const power of this.renderData.powers) {
            if (power.hidden) continue;

            const powerNameLines = this.wrapText(
                fixTextComponent(power.name),
                textWidthLimit
            );
            const powerDescriptionLines = this.wrapText(
                fixTextComponent(power.description),
                textWidthLimit
            );

            for (const powerNameLine of powerNameLines) {
                this.drawTextWithShadowUnderlined(
                    powerNameLine,
                    x,
                    y,
                    textWidthLimit
                );

                y += 12;
            }

            y -= 12;

            if (this.config.showBadges && (power.badges?.length ?? 0) > 0) {
                let badgeStartX =
                    x +
                    this.measureText(powerNameLines[powerNameLines.length - 1]!)
                        .width +
                    4;
                let badgeEndX = x + 135;

                let badgeOffsetX = 0;
                let badgeOffsetY = 0;

                for (const badge of power.badges) {
                    const badgeImage = getBadgeSpriteUrl(badge.sprite);

                    let badgeX = badgeStartX + 10 * badgeOffsetX;
                    let badgeY = y - 8 + 10 * badgeOffsetY;

                    if (badgeX > badgeEndX) {
                        badgeOffsetX = 0;
                        badgeOffsetY++;

                        badgeX = badgeStartX = x;
                        badgeY = y - 8 + 10 * badgeOffsetY;
                    }

                    await this.loadAndDrawImage(
                        badgeImage,
                        badgeX,
                        badgeY,
                        9,
                        9
                    );

                    badgeOffsetX++;
                }

                y += badgeOffsetY * 10;
            }

            for (const powerDescriptionLine of powerDescriptionLines) {
                y += 12;

                this.drawTextWithShadow(
                    powerDescriptionLine,
                    x + 2,
                    y,
                    textWidthLimit,
                    {
                        fillStyle: "#CCCCCC",
                    }
                );
            }

            y += 20;
        }
    }

    protected drawTextWithShadowUnderlined(
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        style?: Partial<CanvasRenderingContext2D>
    ) {
        this.applyTextStyles();

        Object.assign(this.ctx, style);

        const metrics = this.ctx.measureText(text);

        this.ctx.fillText(text, x, y, maxWidth);

        this.ctx.strokeStyle = this.ctx.fillStyle;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 1.5);
        this.ctx.lineTo(x + metrics.width, y + 1.5);
        this.ctx.stroke();

        this.restore();
    }

    protected drawTextWithShadow(
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        style?: Partial<CanvasRenderingContext2D>
    ) {
        this.applyTextStyles();

        Object.assign(this.ctx, style);

        this.ctx.fillText(text, x, y, maxWidth);

        this.restore();
    }

    protected applyTextStyles() {
        this.ctx.save();
        this.ctx.font = "8px Minecraft";
        this.ctx.fillStyle = "white";
        this.ctx.wordSpacing = "2px";

        this.applyTextShadow();

        this.ctx.textAlign = "left";
    }

    protected applyTextShadow() {
        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowBlur = 0;
    }

    protected restore() {
        this.ctx.restore();
    }

    protected measureText(text: string) {
        this.applyTextStyles();

        const metrics = this.ctx.measureText(text);

        this.restore();

        return metrics;
    }

    // utilities:

    protected scale() {
        this.ctx.scale(this.xyScale, this.xyScale);
    }

    protected drawPattern(
        pattern: CanvasPattern,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        this.ctx.fillStyle = pattern;

        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
    }

    protected wrapText(text: string, maxWidth: number) {
        const words = text.split(" ");
        const lines = [];

        let curLine = "";

        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            const testWord = i == 0 ? word : " " + word;

            const lineWidth = this.ctx.measureText(curLine + testWord).width;

            if (lineWidth > maxWidth && i > 0) {
                lines.push(curLine);

                curLine = word!;
            } else {
                curLine += testWord;
            }

            if (i === words.length - 1) {
                lines.push(curLine);
            }
        }

        return lines;
    }

    protected wrapStyledText(text: string, maxWidth: number) {
        this.applyTextStyles();

        const result = this.wrapText(text, maxWidth);

        this.restore();

        return result;
    }

    // resize(width: number, height: number) {
    //     const data = this.ctx.getImageData(
    //         0,
    //         0,
    //         this.canvas.width,
    //         this.canvas.height
    //     );

    //     this.canvas.width = width;
    //     this.canvas.height = height;
    //     this.canvas.style.width = `${width}px`;
    //     this.canvas.style.height = `${height}px`;

    //     this.ctx.putImageData(data as any, 0, 0);
    // }

    // getImageString(x: number, y: number, width: number, height: number) {
    //     const imageData = this.ctx.getImageData(x, y, width, height);

    //     const canvas = document.createElement("canvas");
    //     canvas.width = width;
    //     canvas.height = height;

    //     const ctx = canvas.getContext("2d")!;

    //     ctx.putImageData(imageData, 0, 0);

    //     return canvas.toDataURL("image/png");
    // }

    // getBlob(): Promise<Blob> {
    //     return new Promise((resolve, reject) => {
    //         this.canvas.toBlob((blob) =>
    //             blob
    //                 ? resolve(blob)
    //                 : reject("Failed to create Blob from canvas.")
    //         );
    //     });
    // }
}
