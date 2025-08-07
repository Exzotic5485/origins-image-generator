# Origins Image Generator

[![npm version](https://badgen.net/npm/v/origins-image-generator)](http://npmjs.com/package/origins-image-generator)
[![install size](https://packagephobia.com/badge?p=origins-image-generator)](https://packagephobia.com/result?p=origins-image-generator)

Generate an image of your origin as seen in-game on the Minecraft Origins gui screen. Works on both Node & the browser.

[🌐Hosted Web App](https://origins-image-generator.exzotic.dev/)

## Installation

```bash
  npm install origins-image-generator
```

## Usage/Examples

Node Example:

```typescript
import { Datapack, renderOriginImage } from "origins-image-generator/node";
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
```

Browser Example:

```typescript
import { Datapack, renderOriginImage } from "origins-image-generator/web";

const fileInput = document.querySelector("#datapack-input");

fileInput.addEventListener("change", async (e) => {
    const file = fileInput.files[0];

    if (!file) return;

    // create a Datapack from a datapack zip file / buffer / string / base64 / stream
    const datapack = await Datapack.fromFile(file);

    // make sure to import renderOriginImage() from 'origins-image-generator/web'
    const result = await renderOriginImage(datapack, "origins:avian");

    const blob = await result.blob();
    const dataURL = result.dataURL();

    // do something with blob or dataURL...
});
```

Dynamically generating for all origins in a datapack:

```typescript
import { Datapack, renderOriginImage } from "origins-image-generator/node";
import { readFile, writeFile } from "node:fs/promises";

const datapackFile = await readFile("datapack.zip");

const datapack = await Datapack.fromFile(datapackFile);

for (const [identifier, origin] of datapack.origins) {
    const result = await renderOriginImage(datapack, identifier);

    const img = await result.encode("png");

    await writeFile(`${origin.name}.png`, img);
}
```
