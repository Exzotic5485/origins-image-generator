import DatapackDropzone from "@/components/DatapackDropzone";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/context/AppContext";
import { Datapack, renderOriginImage } from "origins-image-generator/web";

export default function DatapackUpload() {
    const { showBadges, setDatapack, setShowBadges, setRenders } =
        useAppContext();

    const onDatapackSuccess = async (datapack: Datapack) => {
        const renders = await Promise.all(
            [...datapack.origins.entries()].map(async ([id, origin]) => {
                const result = await renderOriginImage(datapack, id, {
                    showBadges,
                });

                return {
                    dataURL: result.dataURL(),
                    origin,
                };
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
