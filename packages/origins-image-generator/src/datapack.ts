import JSZip from "jszip";
import { DEFAULT_BADGES, DEFAULT_POWERS } from "./constants";
import {
    type Badge,
    type DatapackParseError,
    type Origin,
    type OriginRenderData,
    type Power,
    DatapackParseErrorType,
} from "./types";

type InputFileFormat = Parameters<typeof JSZip.loadAsync>[0]; // hacky way of getting the type thats not exported

const ORIGIN_REGEX = /data\/([^\/]+)\/origins\/(.+)\.json/;
const POWER_REGEX = /data\/([^\/]+)\/powers\/(.+)\.json/;
const BADGE_REGEX = /data\/([^\/]+)\/badges\/(.+)\.json/;

export class Datapack {
    zip: JSZip;

    origins: Map<string, Origin> = new Map();
    powers: Map<string, Power> = new Map(DEFAULT_POWERS);
    badges: Map<string, Badge> = new Map(DEFAULT_BADGES);
    errors: DatapackParseError[] = [];

    constructor(zip: JSZip) {
        this.zip = zip;
    }

    static async fromFile(file: InputFileFormat) {
        const zip = new JSZip();
        await zip.loadAsync(file);

        const datapack = new Datapack(zip);

        await datapack.parse();

        return datapack;
    }

    getOriginRenderData(identifier: string): OriginRenderData {
        const origin = this.origins.get(identifier);

        if (!origin)
            throw new Error(
                `Datapack does not contain an origin with identifier '${identifier}'`
            );

        const powers = this.powers
            .entries()
            .filter(([id]) => origin.powers?.includes(id))
            .map(([, power]) => power)
            .toArray();

        const badges: Badge[] = [];

        return {
            origin,
            powers,
            badges,
        };
    }

    private async parse() {
        if (!this.isValidDatapack())
            throw new Error("Datapack does not contain a pack.mcmeta file");

        await Promise.all([
            this.parseOrigins(),
            this.parsePowers(),
            this.parseBadges(),
        ]);

        return this;
    }

    private isValidDatapack() {
        return Object.keys(this.zip.files).some((path) =>
            path.includes("pack.mcmeta")
        );
    }

    private async parseOrigins() {
        const files = this.getMatchingFiles(ORIGIN_REGEX);

        for (const [path] of files) {
            const [_, namespace, origin] = path.match(ORIGIN_REGEX)!;

            const identifier = `${namespace}:${origin}`;

            try {
                const stringContents = await this.getFileContents(path);

                const jsonContents = JSON.parse(stringContents);

                this.origins.set(identifier, jsonContents);
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
