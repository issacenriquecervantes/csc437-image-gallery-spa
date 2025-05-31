import { AllImages } from "./images/AllImages.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route } from "react-router";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { useEffect, useState } from "react";
import {type IImageData} from "../../backend/src/shared/ApiImageData.ts"
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts"

function App() {

    const [imageData, setImageData] = useState<IImageData[]>([]);

    const [fetchingData, setFetchingData] = useState(true);
    const [errorFetchingData, setErrorFetchingData] = useState(false)

    function waitDuration(numMs: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, numMs));
    }

    const handleNameChange = (imageId: string, newName: string) => {
        const newImageData = imageData.map(img => img._id.toString() === imageId ? { ...img, name: newName } : img)
        setImageData(newImageData
        );
    };

    useEffect(() => {
        fetch("/api/images")
            .then(async (response) => {
                await waitDuration(1000);
                return response;
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setImageData(data);
                setErrorFetchingData(false);
            })
            .catch(() => {
                setErrorFetchingData(true);
            })
            .finally(() => {
                setFetchingData(false);
            });
    }, []);

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route index element={<AllImages imageData={imageData} fetchingData={fetchingData} errorFetchingData={errorFetchingData} />} />
                <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
                <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
                <Route path={ValidRoutes.IMAGES} element={<ImageDetails imageData={imageData} fetchingData={fetchingData} errorFetchingData={errorFetchingData} onNameChange={handleNameChange} />} />
            </Route>
        </Routes>
    )
}

export default App;
