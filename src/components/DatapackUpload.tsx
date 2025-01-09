import DatapackDropzone from "@/components/DatapackDropzone";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/context/AppContext";
import type { Datapack } from "@/lib/Datapack";
import { OriginRenderer } from "@/lib/renderer/OriginRenderer";

export default function DatapackUpload() {
    const { showBadges, setDatapack, setShowBadges, setRenders } =
        useAppContext();

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

                return renderer;
            })
        );

        setDatapack(datapack);
        setRenders(renders);
    };

    return (
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
    );
}
