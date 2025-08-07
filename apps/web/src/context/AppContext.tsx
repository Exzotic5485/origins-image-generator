import { Datapack } from "@/lib/Datapack";
import { OriginRenderer } from "@/lib/renderer/OriginRenderer";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

type AppContextType = {
    datapack: Datapack | null;
    setDatapack: React.Dispatch<React.SetStateAction<Datapack | null>>;
    showBadges: boolean;
    setShowBadges: React.Dispatch<React.SetStateAction<boolean>>;
    renders: OriginRenderer[];
    setRenders: React.Dispatch<React.SetStateAction<OriginRenderer[]>>;
    reset: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
    const [datapack, setDatapack] = useState<Datapack | null>(null);
    const [renders, setRenders] = useState<OriginRenderer[]>([]);
    const [showBadges, setShowBadges] = useState(false);

    const reset = () => {
        setDatapack(null);
        setRenders([]);
    }

    return (
        <AppContext.Provider
            value={{
                datapack,
                setDatapack,
                showBadges,
                setShowBadges,
                renders,
                setRenders,
                reset
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);

    if (!context)
        throw new Error("useAppContext must be wrapped within a AppProvider");

    return context;
}
