import { BADGE_TEXTURE_LOCATION } from "@/lib/constants";
import { Renderer } from "./Renderer";

function removeFormattingCharacters(text: string) {
    return text.replace(/&[0-9a-u]/g, "");
}

function textComponentToString(textComponent: TextComponent | TextComponent[]) {
    return typeof textComponent === "string" ? textComponent : Array.isArray(textComponent) ? textComponent.join("") : "";
}

// Temporary until I add text component styling
function fixTextComponent(textComponent?: TextComponent | TextComponent[]) {
    return textComponent ? removeFormattingCharacters(textComponentToString(textComponent)) : "";
}

export class OriginRenderer extends Renderer {
    protected readonly WINDOW_WIDTH = 176;
    protected readonly WINDOW_HEIGHT = 200;

    protected readonly guiLeft: number;
    protected readonly guiTop: number;

    private endY = 0;

    readonly origin: RenderableOrigin;

    showBadges = true;
    dataURL: string | undefined;

    constructor(canvas: HTMLCanvasElement, origin: RenderableOrigin, scale: number = 4) {
        super(canvas);

        this.scale(scale);

        this.origin = origin;

        this.guiLeft = ((this.canvas.width - this.WINDOW_WIDTH * this.scaledBy) / 2) / this.scaledBy;
        this.guiTop = 10;
    }

    static getItemIconURL(icon: string | { item: string } | undefined): string {
        if (!icon) return this.getItemIconURL("minecraft:stone");

        const iconString = typeof icon === "string" ? icon : icon.item;

        let [namespace, path] = iconString.split(":");

        if (!["minecraft", "origins"].includes(namespace)) {
            console.log(`Unknown icon: ${iconString}`);

            namespace = "minecraft";
            path = "stone";
        }

        return `https://mc-items-cdn.exzotic.xyz/${namespace}/${path}.png`;
    }

    async render(showBadges: boolean = true) {
        this.showBadges = showBadges;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        await this.init();

        const containerEnd = this.calculateContentEnd();

        this.endY = this.guiTop + containerEnd;

        if (this.endY * this.scaledBy > this.canvas.height) {
            this.canvas.height = this.canvas.height + (this.endY * this.scaledBy - this.canvas.height) + 20 * this.scaledBy;
            this.canvas.style.height = `${this.canvas.height}px`;

            this.scale(this.scaledBy);
        }

        await this.renderBackground();

        this.ctx.fillStyle = "#555555";
        this.ctx.fillRect(this.guiLeft + 7, this.guiTop, this.WINDOW_WIDTH - 14, this.endY - 10);

        await this.renderOriginContainer();

        this.dataURL = this.getImageString();
    }

    private async init() {
        await this.loadFont("Minecraft", "url('/assets/fonts/minecraftfont.woff')");
    }

    private calculateContentEnd() {
        const textWidthLimit = this.WINDOW_WIDTH - 48;
        let y = this.guiTop + 57;

        y += this.wrapText(fixTextComponent(this.origin.description), textWidthLimit).length * 12 + 12;

        for (const power of this.origin.powers) {
            if (power.hidden) continue;

            const powerNameLines = this.wrapText(fixTextComponent(power.name), textWidthLimit);
            const powerDescriptionLines = this.wrapText(fixTextComponent(power.description), textWidthLimit);

            const requiredHeight = (powerNameLines.length * 12 - 12) + (powerDescriptionLines.length * 12) + 20;

            y += requiredHeight;
        }

        return y;
    }

    private async renderBackground() {
        const backgroundCanvas = await this.createBackgroundCanvas();

        const pattern = this.ctx.createPattern(backgroundCanvas, "repeat")!;

        this.drawPattern(pattern, 0, 0, this.canvas.width, this.canvas.height);
    }

    private async renderOriginContainer() {
        await this.loadAndDrawImage("/assets/border_start.png", this.guiLeft, this.guiTop, this.WINDOW_WIDTH, 10);
        await this.loadAndDrawImage("/assets/name_plate.png", this.guiLeft + 10, this.guiTop + 10, 150, 26);

        await this.loadAndDrawImage("/assets/impact/low.png", this.guiLeft + 128, this.guiTop + 19, 28, 8);

        await this.loadAndDrawImage(OriginRenderer.getItemIconURL(this.origin.icon), this.guiLeft + 15, this.guiTop + 15, 16, 16);

        this.drawTextWithShadow(fixTextComponent(this.origin.name), this.guiLeft + 39, this.guiTop + 26, this.WINDOW_WIDTH - (62 + 3 * 8))

        await this.renderOriginContent();

        await this.loadAndDrawImage("/assets/border_sides.png", this.guiLeft, this.guiTop + 10, this.WINDOW_WIDTH, this.endY - 20);
        await this.loadAndDrawImage("/assets/border_end.png", this.guiLeft, Math.max(this.guiTop + this.WINDOW_HEIGHT - 10, this.endY), this.WINDOW_WIDTH, 10);
    }

    private async renderOriginContent() {
        const textWidthLimit = this.WINDOW_WIDTH - 48;

        let x = this.guiLeft + 18;
        let y = this.guiTop + 57;

        for (const descriptionLine of this.wrapText(fixTextComponent(this.origin.description), textWidthLimit)) {
            this.drawTextWithShadow(descriptionLine, x + 2, y, textWidthLimit, {
                fillStyle: "#CCCCCC",
            });

            y += 12;
        }

        y += 12;

        for (const power of this.origin.powers) {
            if (power.hidden) continue;

            const powerNameLines = this.wrapText(fixTextComponent(power.name), textWidthLimit);
            const powerDescriptionLines = this.wrapText(fixTextComponent(power.description), textWidthLimit);

            for (const powerNameLine of powerNameLines) {
                this.drawTextWithShadowUnderlined(powerNameLine, x, y, textWidthLimit);

                y += 12;
            }

            y -= 12;

            if (this.showBadges && power.badges) {
                let badgeStartX = x + this.measureText(powerNameLines[powerNameLines.length - 1]).width + 4;
                let badgeEndX = x + 135;

                let badgeOffsetX = 0;
                let badgeOffsetY = 0;

                for (const badge of power.badges) {
                    const badgeImage = badge.sprite.replace("origins:", BADGE_TEXTURE_LOCATION);

                    let badgeX = badgeStartX + 10 * badgeOffsetX;
                    let badgeY = (y - 8) + 10 * badgeOffsetY;

                    if (badgeX > badgeEndX) {
                        badgeOffsetX = 0;
                        badgeOffsetY++;

                        badgeX = badgeStartX = x;
                        badgeY = (y - 8) + 10 * badgeOffsetY;
                    }

                    await this.loadAndDrawImage(badgeImage, badgeX, badgeY, 9, 9);

                    badgeOffsetX++;
                }

                y += badgeOffsetY * 10;
            }

            for (const powerDescriptionLine of powerDescriptionLines) {
                y += 12;

                this.drawTextWithShadow(powerDescriptionLine, x + 2, y, textWidthLimit, {
                    fillStyle: "#CCCCCC"
                });
            }

            y += 20;
        }
    }


    private async createBackgroundCanvas() {
        const canvas = document.createElement("canvas");

        canvas.width = 32;
        canvas.height = 32;

        const renderer = new Renderer(canvas);
        renderer.ctx.filter = "brightness(0.25)";

        await renderer.loadAndDrawImage("/assets/dirt_background.png", 0, 0, 32, 32);

        return canvas;
    }

    private drawTextWithShadowUnderlined(text: string, x: number, y: number, maxWidth: number, style?: Partial<CanvasRenderingContext2D>) {
        this.applyTextStyles();

        Object.assign(this.ctx, style);

        const metrics = this.ctx.measureText(text);

        this.ctx.fillText(
            text,
            x,
            y,
            maxWidth
        );

        this.ctx.strokeStyle = this.ctx.fillStyle;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 1.5);
        this.ctx.lineTo(x + metrics.width, y + 1.5);
        this.ctx.stroke();

        this.restore();
    }

    private drawTextWithShadow(text: string, x: number, y: number, maxWidth: number, style?: Partial<CanvasRenderingContext2D>) {
        this.applyTextStyles();

        Object.assign(this.ctx, style);

        this.ctx.fillText(
            text,
            x,
            y,
            maxWidth
        );

        this.restore();
    }

    private applyTextStyles() {
        this.ctx.save();
        this.ctx.font = "8px Minecraft";
        this.ctx.fillStyle = "white";
        this.ctx.wordSpacing = "2px";

        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowBlur = 0;

        this.ctx.textAlign = "left";
    }

    private restore() {
        this.ctx.restore();
    }

    measureText(text: string) {
        this.applyTextStyles();

        const metrics = this.ctx.measureText(text);

        this.restore();

        return metrics;
    }

    override getImageString() {
        return super.getImageString(this.guiLeft * this.scaledBy, this.guiTop * this.scaledBy, this.WINDOW_WIDTH * this.scaledBy, this.endY * this.scaledBy);
    }

    override wrapText(text: string, maxWidth: number) {
        this.applyTextStyles();

        const result = super.wrapText(text, maxWidth);

        this.restore();

        return result;
    }
}