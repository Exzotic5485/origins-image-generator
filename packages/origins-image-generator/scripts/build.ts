import { $, build, type BuildConfig } from "bun";

const opts: Partial<BuildConfig> = {
    packages: "external",
    minify: false,
};

const entrypoints = [
    "./src/index.ts",
    "./src/web/index.ts",
    "./src/node/index.ts",
];

const esm = () =>
    build({
        ...opts,
        entrypoints,
        outdir: "./dist/esm",
        format: "esm",
    });

const cjs = () =>
    build({
        ...opts,
        entrypoints,
        outdir: "./dist/cjs",
        format: "cjs",
    });

const tsc = () => $`tsc --project tsconfig.types.json`;

const readme = () => $`rm -f README.md && cp ../../README.md ./README.md`;

await $`rm -rf dist`;
await Promise.all([esm(), cjs(), tsc(), readme()]);
