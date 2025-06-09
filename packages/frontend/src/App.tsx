import { AllImages } from "./images/AllImages.tsx";
import { UploadPage } from "./UploadPage.tsx";
import { LoginPage } from "./LoginPage.tsx";
import { Routes, Route, useNavigate } from "react-router";
import { ImageDetails } from "./images/ImageDetails.tsx";
import { MainLayout } from "./MainLayout.tsx";
import { useRef, useState } from "react";
import { type IImageData } from "../../backend/src/shared/ApiImageData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import { ProtectedRoute } from "../../backend/src/routes/ProtectedRoute.tsx";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

function App() {
    const [imageData, setImageData] = useState<IImageData[]>([]);

    const [fetchingData, setFetchingData] = useState(true);
    const [errorFetchingData, setErrorFetchingData] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const [authToken, setAuthToken] = useState("");

    const navigate = useNavigate();

    const requestRef = useRef(0);

    function handleImageSearch() {
        fetchImagesFromAPI(authToken, searchQuery);
    }

    const fetchImagesFromAPI = async (
        token: string,
        searchSubstring?: string
    ) => {
        const APIQuery = searchQuery ? `?substring=${searchSubstring}` : "";
        requestRef.current = requestRef.current + 1;
        let thisRequestRef = requestRef.current;

        setFetchingData(true);
        await fetch(`/api/images${APIQuery}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (response) => {
                await waitDuration(Math.random() * 2500);
                return response;
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                if (requestRef.current === thisRequestRef) {
                    setImageData(data);
                    setErrorFetchingData(false);
                }
            })
            .catch(() => {
                requestRef.current === thisRequestRef && setErrorFetchingData(true);
            })
            .finally(() => {
                requestRef.current === thisRequestRef && setFetchingData(false);
            });
    };

    const searchPanel = () => {
        return (
            <ImageSearchForm
                searchString={searchQuery}
                onSearchStringChange={(inputString) => {
                    setSearchQuery(inputString);
                }}
                onSearchRequested={handleImageSearch}
            />
        );
    };

    function waitDuration(numMs: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, numMs));
    }

    const handleNameChange = (imageId: string, newName: string) => {
        const newImageData = imageData.map((img) =>
            img._id.toString() === imageId ? { ...img, name: newName } : img
        );
        setImageData(newImageData);
    };

    return (
        <Routes>
            <Route path={ValidRoutes.HOME} element={<MainLayout />}>
                <Route
                    index
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <AllImages
                                imageData={imageData}
                                fetchingData={fetchingData}
                                errorFetchingData={errorFetchingData}
                                searchPanel={searchPanel()}
                            />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.UPLOAD}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <UploadPage token={authToken} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path={ValidRoutes.LOGIN}
                    element={
                        <LoginPage
                            isRegistering={false}
                            handleAuthToken={(generatedToken) => {
                                setAuthToken(generatedToken);
                                fetchImagesFromAPI(generatedToken);
                                navigate("/");
                            }}
                        />
                    }
                />
                <Route
                    path={ValidRoutes.REGISTER}
                    element={
                        <LoginPage
                            isRegistering={true}
                            handleAuthToken={(generatedToken) => {
                                setAuthToken(generatedToken);
                                fetchImagesFromAPI(generatedToken);
                                navigate("/");
                            }}
                        />
                    }
                />
                <Route
                    path={ValidRoutes.IMAGES}
                    element={
                        <ProtectedRoute authToken={authToken}>
                            <ImageDetails
                                imageData={imageData}
                                fetchingData={fetchingData}
                                errorFetchingData={errorFetchingData}
                                onNameChange={handleNameChange}
                                token={authToken}
                            />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
