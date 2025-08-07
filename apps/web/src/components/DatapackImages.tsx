import DatapackCard from "@/components/DatapackCard";
import ErrorCard from "@/components/ErrorCard";
import { useAppContext } from "@/context/AppContext";

export default function DatapackImages() {
    const { datapack } = useAppContext();

    return (
        <div className="container px-2 sm:px-4 md:px-8 py-8 space-y-8">
            <div className="flex flex-col gap-4">
                {datapack?.errors.map((error, i) => (
                    <ErrorCard
                        key={i}
                        error={error}
                    />
                ))}
            </div>
            <DatapackCard />
        </div>
    );
}
