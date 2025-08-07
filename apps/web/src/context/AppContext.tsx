import type { Datapack, Origin } from "origins-image-generator/web";
import {
    createContext,
    useContext,
    useState,
    type PropsWithChildren,
} from "react";

type OriginRender = {
    origin: Origin;
    dataURL: string;
};

type AppContextType = {
    datapack: Datapack | null;
    setDatapack: React.Dispatch<React.SetStateAction<Datapack | null>>;
    showBadges: boolean;
    setShowBadges: React.Dispatch<React.SetStateAction<boolean>>;
    renders: OriginRender[];
    setRenders: React.Dispatch<React.SetStateAction<OriginRender[]>>;
    reset: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
    const [datapack, setDatapack] = useState<Datapack | null>(null);
    const [renders, setRenders] = useState<OriginRender[]>([]);
    const [showBadges, setShowBadges] = useState(false);

    const reset = () => {
        setDatapack(null);
        setRenders([]);
    };

    return (
        <AppContext.Provider
            value={{
                datapack,
                setDatapack,
                showBadges,
                setShowBadges,
                renders,
                setRenders,
                reset,
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
