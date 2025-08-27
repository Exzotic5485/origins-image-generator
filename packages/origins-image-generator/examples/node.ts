// @ts-nocheck
import { Datapack, renderOriginImage } from "origins-image-generator";
import { readFile, writeFile } from "node:fs/promises";

const datapackFile = await readFile("datapack.zip");

// create a Datapack from a datapack zip file buffer / string / base64 / stream
const datapack = await Datapack.fromFile(datapackFile);

// make sure to import renderOriginImage() from 'origins-image-generator/node'
const result = await renderOriginImage(datapack, "origins:avian");

// get the result as a Buffer encoded with png
const imgFile = await result.encode("png");

await writeFile("image.png", imgFile);

// get the result as a base64 data url example: 'data:image/png;base64,b3JpZ2lucy1pbWFnZS1nZW5lcmF0b3I='
const dataURL = result.toDataURL();

console.log(dataURL);
