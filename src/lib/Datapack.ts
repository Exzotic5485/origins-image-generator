import JSZip from "jszip";
import { DEFAULT_ORIGINS, DEFAULT_POWERS } from "./constants";

const ORIGIN_REGEX = /data\/([^\/]+)\/origins\/(.+)/;
const POWER_REGEX = /data\/([^\/]+)\/powers\/(.+)/;

export class Datapack {
    file: File;
    zip: JSZip;

    origins: OriginData[] = [...DEFAULT_ORIGINS];
    powers: Map<string, PowerData> = new Map(DEFAULT_POWERS);

    constructor(file: File) {
        this.file = file;
        this.zip = new JSZip();
    }

    async parse() {
        await this.zip.loadAsync(this.file);

        if (!this.isValidDatapack()) throw new Error("Invalid datapack provided.");

        await Promise.all([
            this.parseOrigins(),
            this.parsePowers(),
        ]);

        return this;
    }

    isValidDatapack() {
        return Boolean(this.zip.files["pack.mcmeta"]);
    }

    getRenderableOrigin(identifier: string) {
        const origin = this.origins.find((o) => o.identifier === identifier);

        if (!origin) throw new Error(`Origin not found: ${identifier}`);

        const renderableOrigin: RenderableOrigin = {
            ...origin,
            powers: origin.powers?.map((power) => this.powers.get(power)!).filter(Boolean) || [],
        };

        return renderableOrigin;
    }

    private async parseOrigins() {
        const files = Object.entries(this.zip.files).filter((([path, file]) => path.match(ORIGIN_REGEX) && !file.dir && file.name.endsWith(".json")));

        for (const [path] of files) {
            const [_, namespace, origin] = path.match(ORIGIN_REGEX)!;

            const stringContents = await this.getFileContents(path);

            const jsonContents = JSON.parse(stringContents);

            this.origins.push({
                ...jsonContents,
                identifier: `${namespace}:${origin.replace(".json", "")}`,
            });
        }
    }

    private async parsePowers() {
        const files = Object.entries(this.zip.files).filter((([path, file]) => path.match(POWER_REGEX) && !file.dir && file.name.endsWith(".json")));

        for (const [path] of files) {
            const [_, namespace, power] = path.match(POWER_REGEX)!;

            const stringContents = await this.getFileContents(path);

            const jsonContents = JSON.parse(stringContents);

            this.powers.set(`${namespace}:${power.replace(".json", "")}`, jsonContents);
        }
    }

    private getFileContents(path: string) {
        return this.zip.file(path)!.async("string");
    }
}