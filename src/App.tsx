import DatapackDropzone from "@/components/DatapackDropzone";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Datapack } from "@/lib/Datapack";
import { OriginRenderer } from "@/lib/renderer/OriginRenderer";
import { DownloadIcon, RotateCcwIcon } from "lucide-react";
import { useState } from "react";

function App() {
    const [datapack, setDatapack] = useState<Datapack>();
    const [renders, setRenders] = useState<string[]>([]);
    const [showBadges, setShowBadges] = useState(true);

    const onDatapackSuccess = async (datapack: Datapack) => {
        const renders = await Promise.all(
            datapack.origins.map(async (origin) => {
                const canvas = document.createElement("canvas");

                canvas.width = 704;
                canvas.height = 300;

                const renderer = new OriginRenderer(
                    canvas,
                    datapack.getRenderableOrigin(origin.identifier)
                );

                await renderer.render(showBadges);

                return renderer.getImageString();
            })
        );

        setDatapack(datapack);
        setRenders(renders);
    };

    return (
        <div>
            <Header />
            {datapack ? (
                <div className="container px-2 sm:px-4 md:px-8 py-8">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                                <CardTitle>
                                    Datapack -{" "}
                                    <span className="text-muted-foreground">
                                        {datapack.file.name}
                                    </span>
                                </CardTitle>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setDatapack(undefined);
                                        setRenders([]);
                                    }}
                                >
                                    <RotateCcwIcon className="size-4 mr-1" />
                                    Restart
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid space-y-4 md:space-y-0 md:grid-cols-2 lg:grid-cols-3 gap-[2rem_1rem]">
                                {renders.map((imgData, i) => (
                                    <div className="flex flex-col gap-4" key={i}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="self-start"
                                            asChild
                                        >
                                            <a
                                                href={imgData}
                                                download={
                                                    datapack.origins[i].name ||
                                                    datapack.origins[i]
                                                        .identifier
                                                }
                                            >
                                                <DownloadIcon className="size-5 mr-1" />
                                                Download
                                            </a>
                                        </Button>
                                        <img
                                            className="w-full h-full object-contain"
                                            src={imgData}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="container px-2 sm:px-4 md:px-8 py-8 space-y-4">
                    <h1 className="text-center font-bold text-3xl tracking-tight">
                        Upload Datapack to Start
                    </h1>
                    <div className="bg-card p-6 rounded-xl max-w-3xl flex-1 mx-auto space-y-8">
                        <DatapackDropzone onSuccess={onDatapackSuccess} />
                        <div className="flex justify-end items-center space-x-2">
                            <Switch
                                checked={showBadges}
                                onCheckedChange={setShowBadges}
                            />
                            <Label>Show Badges</Label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
