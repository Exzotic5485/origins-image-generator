import GithubIcon from "@/components/icons/GithubIcon";
import { Button } from "@/components/ui/button";
import { MC_ASSETS_LOCATION } from "origins-image-generator/web";

export default function Header() {
    return (
        <div className="h-16 border-b">
            <div className="container px-2 sm:px-4 md:px-8 h-full w-full flex items-center justify-between">
                <a href="/" className="flex items-center gap-1">
                    <img
                        className="size-12 image-pixelated"
                        src={`${MC_ASSETS_LOCATION}/origins/orb_of_origin.png`}
                    />
                    <h1 className="text-base sm:text-xl md:text-2xl tracking-tight font-semibold">
                        Origins Image Generator
                    </h1>
                </a>
                <Button
                    variant="secondary"
                    asChild
                >
                    <a href="https://github.com/Exzotic5485/origins-image-generator">
                        <GithubIcon className="size-5 mr-1 fill-white" />
                        Github
                    </a>
                </Button>
            </div>
        </div>
    );
}
