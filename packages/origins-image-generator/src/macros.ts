import Bun from "bun";

async function _embedAsset(path: string) {
    const file = Bun.file(path);

    if (!(await file.exists()))
        throw new Error(
            `Unable to embed asset as asset '${path}' does not exist`
        );

    const bytes = await file.bytes();

    return `data:${file.type};base64,${bytes.toBase64()}`;
}

// need to do this to fix types, macros are awaited at build time
export const embedAsset = _embedAsset as any as (path: string) => string;
