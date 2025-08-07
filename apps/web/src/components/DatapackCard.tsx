import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";
import { dataURLToBase64, generateRandomFileName, saveFile } from "@/lib/utils";
import JSZip from "jszip";
import { DownloadIcon, RotateCcwIcon } from "lucide-react";

export default function DatapackCard() {
    const { renders, datapack, reset } = useAppContext();

    if (!datapack) return null;

    const handleDownloadAll = async () => {
        const zip = new JSZip();

        for (let i = 0; i < renders.length; i++) {
            const render = renders[i];

            zip.file(
                `${render.origin.name || i}.png`,
                dataURLToBase64(render.dataURL)
            );
        }

        const file = await zip.generateAsync({ type: "blob" });

        saveFile(file, generateRandomFileName("zip"));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                    <CardTitle>Datapack Origins</CardTitle>
                    <div className="space-x-4">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleDownloadAll}
                        >
                            <DownloadIcon className="size-4 mr-1" />
                            Download All
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={reset}
                        >
                            <RotateCcwIcon className="size-4 mr-1" />
                            Restart
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid space-y-4 md:space-y-0 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
                    {renders.map((render, i) => (
                        <div
                            className="flex flex-col gap-4"
                            key={i}
                        >
                            <Button
                                variant="secondary"
                                size="sm"
                                className="self-start"
                                asChild
                            >
                                <a
                                    href={render.dataURL}
                                    download={generateRandomFileName()}
                                >
                                    <DownloadIcon className="size-5 mr-1" />
                                    Download
                                </a>
                            </Button>
                            <img
                                className="w-full"
                                src={render.dataURL}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
