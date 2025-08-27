import { Datapack, renderOriginImage } from "origins-image-generator";

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
