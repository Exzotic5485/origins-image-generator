import DatapackImages from "@/components/DatapackImages";
import DatapackUpload from "@/components/DatapackUpload";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";

function App() {
    const { datapack } = useAppContext();

    return (
        <div>
            <Header />
            {datapack ? <DatapackImages /> : <DatapackUpload />}
        </div>
    );
}

export default App;
