import JSZip from "jszip";
import { DEFAULT_BADGES, DEFAULT_ORIGINS, DEFAULT_POWERS } from "./constants";

const ORIGIN_REGEX = /data\/([^\/]+)\/origins\/(.+)\.json/;
const POWER_REGEX = /data\/([^\/]+)\/powers\/(.+)\.json/;
const BADGE_REGEX = /data\/([^\/]+)\/badges\/(.+)\.json/;

export enum DatapackParseErrorType {
    ORIGIN = "ORIGIN",
    POWER = "POWER",
    BADGE = "BADGE",
}

export type DatapackParseError = {
    type: DatapackParseErrorType;
    filePath: string;
    error: string;
    identifier: string;
};

export class Datapack {
    file: File;
    zip: JSZip;

    origins: OriginData[] = [...DEFAULT_ORIGINS];
    powers: Map<string, PowerData> = new Map(DEFAULT_POWERS);
    badges: Map<string, BadgeData> = new Map(DEFAULT_BADGES);
    errors: DatapackParseError[] = [];

    constructor(file: File) {
        this.file = file;
        this.zip = new JSZip();
    }

    async parse() {
        await this.zip.loadAsync(this.file);

        if (!this.isValidDatapack())
            throw new Error("Invalid datapack provided.");

        await Promise.all([
            this.parseOrigins(),
            this.parsePowers(),
            this.parseBadges(),
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
            powers:
                origin.powers
                    ?.map((power) => this.getRenderablePower(power))
                    .filter((power) => power !== null) || [],
        };

        return renderableOrigin;
    }

    getRenderablePower(identifier: string): RenderablePower | null {
        const power = this.powers.get(identifier);

        if (!power) return null;

        const renderablePower: RenderablePower = {
            ...power,
            badges:
                power.badges
                    ?.map((badge) =>
                        typeof badge === "string"
                            ? this.badges.get(badge)
                            : badge
                    )
                    .filter((badge) => badge !== undefined) || [],
        };

        return renderablePower;
    }

    private async parseOrigins() {
        const files = this.getMatchingFiles(ORIGIN_REGEX);

        for (const [path] of files) {
            const [_, namespace, origin] = path.match(ORIGIN_REGEX)!;

            const identifier = `${namespace}:${origin}`;

            try {
                const stringContents = await this.getFileContents(path);

                const jsonContents = JSON.parse(stringContents);

                this.origins.push({
                    ...jsonContents,
                    identifier,
                });
            } catch (e: any) {
                this.errors.push({
                    type: DatapackParseErrorType.ORIGIN,
                    error: e?.message ?? e,
                    filePath: path,
                    identifier,
                });
            }
        }
    }

    private async parsePowers() {
        const files = this.getMatchingFiles(POWER_REGEX);

        for (const [path] of files) {
            const [_, namespace, power] = path.match(POWER_REGEX)!;

            const identifier = `${namespace}:${power}`;

            try {
                const stringContents = await this.getFileContents(path);

                const jsonContents = JSON.parse(stringContents);

                this.powers.set(identifier, jsonContents);
            } catch (e: any) {
                this.errors.push({
                    type: DatapackParseErrorType.POWER,
                    error: e?.message ?? e,
                    filePath: path,
                    identifier,
                });
            }
        }
    }

    private async parseBadges() {
        const files = this.getMatchingFiles(BADGE_REGEX);

        for (const [path] of files) {
            const [_, namespace, badge] = path.match(BADGE_REGEX)!;

            const identifier = `${namespace}:${badge}`;

            try {
                const stringContents = await this.getFileContents(path);

                const jsonContents = JSON.parse(stringContents);

                this.badges.set(identifier, jsonContents);
            } catch (e: any) {
                this.errors.push({
                    type: DatapackParseErrorType.BADGE,
                    error: e?.message ?? e,
                    filePath: path,
                    identifier,
                });
            }
        }
    }

    private getMatchingFiles(regex: RegExp) {
        return Object.entries(this.zip.files).filter(
            ([path, file]) => path.match(regex) && !file.dir
        );
    }

    private getFileContents(path: string) {
        return this.zip.file(path)!.async("string");
    }
}
