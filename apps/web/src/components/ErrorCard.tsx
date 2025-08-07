import { Card } from "@/components/ui/card";
import type { DatapackParseError } from "origins-image-generator/web";
import { CircleAlertIcon } from "lucide-react";

type ErrorCardProps = {
    error: DatapackParseError;
};

export default function ErrorCard({ error }: ErrorCardProps) {
    return (
        <Card className="bg-destructive/30 text-destructive border-none p-4 flex items-center gap-2">
            <CircleAlertIcon className="size-6" />
            <p>
                Failed to parse {error.type.toLowerCase()} {error.identifier} (
                {error.filePath})
            </p>
        </Card>
    );
}
