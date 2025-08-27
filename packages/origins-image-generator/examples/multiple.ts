// @ts-nocheck
import { Datapack, renderOriginImage } from "origins-image-generator";
import { readFile, writeFile } from "node:fs/promises";

const datapackFile = await readFile("datapack.zip");

const datapack = await Datapack.fromFile(datapackFile);

for (const [identifier, origin] of datapack.origins) {
    const result = await renderOriginImage(datapack, identifier);

    const img = await result.encode("png");

    await writeFile(`${origin.name}.png`, img);
}
