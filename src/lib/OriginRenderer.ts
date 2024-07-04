import { Renderer } from "./Renderer";

interface OriginData {
    name: string;
    impact: "low" | "medium" | "high" | "none";
    description: string;
    powers: OriginPowerData[];
}

interface OriginPowerData {
    hidden?: boolean;
    name: string;
    description: string;
}

export class OriginRenderer extends Renderer {
    protected readonly WINDOW_WIDTH = 176;
    protected readonly WINDOW_HEIGHT = 200;

    protected readonly guiLeft: number;
    protected readonly guiTop: number;

    private dirtBackgroundPattern?: CanvasPattern;

    private endY = 0;
    private borderEnd = 0;
    private backgroundEnd = 0;

    readonly origin: OriginData;

    constructor(canvas: HTMLCanvasElement, origin: OriginData, scale: number = 4) {
        super(canvas);

        this.scale(scale);

        this.origin = origin;

        this.guiLeft = ((this.canvas.width - this.WINDOW_WIDTH * this.scaledBy) / 2) / this.scaledBy;
        this.guiTop = 10;
        this.borderEnd = this.guiTop + this.WINDOW_HEIGHT - 10;
        this.backgroundEnd = this.guiTop + this.WINDOW_HEIGHT - 8;
    }

    debug(...args: string[]) {
        console.log(`[Debug]\nWindow Height: ${window.innerHeight}\nCanvas Height: ${this.canvas.height}\nScale: ${this.scaledBy}\nContent End: ${this.endY}\nBorder End: ${this.borderEnd}\nBackground End: ${this.backgroundEnd}\n${args.join("\n")}`);
    }

    async render() {
        await this.init();

        const containerEnd = this.calculateContentEnd();

        this.endY = this.guiTop + containerEnd * this.scaledBy;

        const diff = containerEnd - this.WINDOW_HEIGHT;

        this.debug(`Diff: ${diff}`);

        if (this.endY > this.canvas.height) {
            this.canvas.height = this.canvas.height + (this.endY - this.canvas.height) + 20 * this.scaledBy;
            this.canvas.style.height = `${this.canvas.height}px`;

            this.scale(this.scaledBy);
        }

        await this.renderBackground();

        this.ctx.fillStyle = "#555555";
        this.ctx.fillRect(this.guiLeft, this.guiTop, this.WINDOW_WIDTH, ((this.endY - 20) / this.scaledBy));

        await this.renderOriginContainer();
    }

    private async init() {
        await this.loadFont("Minecraft", "url('/assets/fonts/minecraftfont.woff')");

        this.dirtBackgroundPattern = this.ctx.createPattern(
            await this.createDirtCanvas(),
            "repeat"
        )!;
    }

    calculateContentEnd() {
        const textWidthLimit = this.WINDOW_WIDTH - 48;
        let y = this.guiTop + 57;

        y += this.wrapText(this.origin.description, textWidthLimit).length * 12 + 12;

        for (const power of this.origin.powers) {
            if (power.hidden) continue;

            const powerNameLines = this.wrapText(power.name, textWidthLimit);
            const powerDescriptionLines = this.wrapText(power.description, textWidthLimit);

            const requiredHeight = (powerNameLines.length * 12 - 12) + (powerDescriptionLines.length * 12) + 20;

            y += requiredHeight;
        }

        return y;
    }

    private async renderOriginContainer() {
        await this.loadAndDrawImage("/assets/border_start.png", this.guiLeft, this.guiTop, this.WINDOW_WIDTH, this.WINDOW_HEIGHT - 10);
        await this.loadAndDrawImage("/assets/name_plate.png", this.guiLeft + 10, this.guiTop + 10, 150, 26);

        await this.loadAndDrawImage("/assets/feather.png", this.guiLeft + 15, this.guiTop + 15, 16, 16);
        await this.loadAndDrawImage("/assets/impact/low.png", this.guiLeft + 128, this.guiTop + 19, 28, 8);

        this.drawTextWithShadow(this.origin.name, this.guiLeft + 39, this.guiTop + 26, this.WINDOW_WIDTH - (62 + 3 * 8))

        this.renderOriginContent();

        await this.loadAndDrawImage("/assets/border_sides.png", this.guiLeft, this.borderEnd - 10, this.WINDOW_WIDTH, this.endY - 162 - 20);
        await this.loadAndDrawImage("/assets/border_end.png", this.guiLeft, Math.max(this.guiTop + this.WINDOW_HEIGHT - 10, this.endY), this.WINDOW_WIDTH, 10);
    }

    private renderOriginContent() {
        const textWidthLimit = this.WINDOW_WIDTH - 48;

        let x = this.guiLeft + 18;
        let y = this.guiTop + 57;

        for (const descriptionLine of this.wrapText(this.origin.description, textWidthLimit)) {
            this.drawTextWithShadow(descriptionLine, x + 2, y, textWidthLimit, {
                fillStyle: "#CCCCCC",
            });

            y += 12;
        }

        y += 12;

        for (const power of this.origin.powers) {
            if (power.hidden) continue;

            const powerNameLines = this.wrapText(power.name, textWidthLimit);
            const powerDescriptionLines = this.wrapText(power.description, textWidthLimit);

            for (const powerNameLine of powerNameLines) {
                this.drawTextWithShadowUnderlined(powerNameLine, x, y, textWidthLimit);

                y += 12;
            }

            y -= 12;

            for (const powerDescriptionLine of powerDescriptionLines) {
                y += 12;

                this.drawTextWithShadow(powerDescriptionLine, x + 2, y, textWidthLimit, {
                    fillStyle: "#CCCCCC"
                });
            }

            y += 20;
        }
    }

    private async renderBackground() {
        this.renderDirtBackground(0, 0, this.canvas.width, this.canvas.height);

    }

    private renderDirtBackground(x: number, y: number, width: number, height: number) {
        this.drawPattern(this.dirtBackgroundPattern!, x, y, width, height);
    }

    private async createDirtCanvas() {
        const canvas = document.createElement("canvas");

        canvas.width = 32;
        canvas.height = 32;

        const renderer = new Renderer(canvas);
        renderer.ctx.filter = "brightness(0.25)";

        await renderer.loadAndDrawImage("/assets/dirt_background.png", 0, 0, 32, 32);

        return canvas;
    }

    private drawTextWithShadowUnderlined(text: string, x: number, y: number, maxWidth: number, style?: Partial<CanvasRenderingContext2D>) {
        this.ctx.save();
        this.ctx.font = "8px Minecraft";
        this.ctx.fillStyle = "white";
        this.ctx.wordSpacing = "2px";

        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowBlur = 0;

        this.ctx.textAlign = "left";

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
        this.ctx.restore();
    }

    private drawTextWithShadow(text: string, x: number, y: number, maxWidth: number, style?: Partial<CanvasRenderingContext2D>) {
        this.ctx.save();

        this.ctx.font = "8px Minecraft";
        this.ctx.fillStyle = "white";
        this.ctx.wordSpacing = "2px";

        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowBlur = 0;

        this.ctx.textAlign = "left";

        Object.assign(this.ctx, style);

        this.ctx.fillText(
            text,
            x,
            y,
            maxWidth
        );

        this.ctx.restore();
    }

    override wrapText(text: string, maxWidth: number) {
        this.ctx.save();
        this.ctx.font = "8px Minecraft";
        this.ctx.fillStyle = "white";
        this.ctx.wordSpacing = "2px";

        this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        this.ctx.shadowBlur = 0;

        this.ctx.textAlign = "left";

        const result = super.wrapText(text, maxWidth);

        this.ctx.restore();

        return result;
    }
}