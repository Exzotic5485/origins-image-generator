export class Renderer {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;

    private imageCache = new Map<string, HTMLImageElement>();

    protected scaledBy: number = 1

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
    }

    async loadAndDrawImage(
        imageSource: string,
        dx: number,
        dy: number,
        dw: number,
        dh: number
    ) {
        const image = await this.loadImage(imageSource);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(image, dx, dy, dw, dh);
    }

    async loadImage(imageSource: string) {
        if (this.imageCache.has(imageSource)) {
            return this.imageCache.get(imageSource)!;
        }

        return new Promise<HTMLImageElement>((resolve) => {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.src = imageSource;

            image.onload = () => {
                this.imageCache.set(imageSource, image);

                resolve(image);
            };
        });

    }

    protected scale(scale: number) {
        this.scaledBy = scale;

        this.ctx.scale(scale, scale);
    }

    drawPattern(pattern: CanvasPattern, x: number, y: number, width: number, height: number) {
        this.ctx.fillStyle = pattern;

        this.ctx.rect(x, y, width, height);
        this.ctx.fill();
    }

    wrapText(text: string, maxWidth: number) {
        const words = text.split(" ");
        const lines = [];

        let curLine = "";

        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            const testWord = i == 0 ? word : " " + word

            const lineWidth = this.ctx.measureText(curLine + testWord).width;

            if (lineWidth > maxWidth && i > 0) {
                lines.push(curLine);

                curLine = word;
            } else {
                curLine += testWord;
            }

            if (i === words.length - 1) {
                lines.push(curLine);
            }
        }

        return lines;
    }

    resize(width: number, height: number) {
        const data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.putImageData(data, 0, 0);
    }

    async loadFont(family: string, source: string) {
        const fontFace = new FontFace(
            family,
            source
        );

        await fontFace.load();

        document.fonts.add(fontFace);
    }

    getImageString(x: number, y: number, width: number, height: number) {
        const imageData = this.ctx.getImageData(x, y, width, height);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d")!;

        ctx.putImageData(imageData, 0, 0);

        return canvas.toDataURL("image/png");
    }
}