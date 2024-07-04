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
            image.src = imageSource;

            image.onload = () => {
                this.imageCache.set(imageSource, image);

                resolve(image);
            };
        });

    }

    scale(scale: number) {
        this.scaledBy = scale;

        const scaledWidth = this.canvas.width * scale;
        const scaledHeight = this.canvas.height * scale;

        this.ctx.translate(
            -((scaledWidth - this.canvas.width) / 2),
            -((scaledHeight - this.canvas.height) / 2)
        );

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

            // console.log(`CURRENT WORD: ${word}\nCURRENT LINE: ${curLine}\nLINES: ${lines}\nCURRENT LINE WIDTH: ${lineWidth}\nMAX WIDTH: ${maxWidth}`)

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
}