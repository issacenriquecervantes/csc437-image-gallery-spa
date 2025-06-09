import { type IImageData } from "../../../backend/src/shared/ApiImageData.ts"
import { ImageGrid } from "./ImageGrid.tsx";

export function AllImages(props: {
    errorFetchingData: boolean;
    fetchingData: boolean; imageData: IImageData[];
    searchPanel: React.ReactNode
}) {
    return (
        <>
            {props.searchPanel}

            {props.fetchingData === false && props.errorFetchingData == false ?
                <>{props.imageData.length === 0 ? <h2>No Images Found</h2> : <><h2>All Images</h2><ImageGrid images={props.imageData.map(img => ({
                    ...img,
                    _id: (img as any)._id ?? "",
                    authorId: (img as any).authorId ?? ""
                }))} /></>}</> : props.fetchingData === true ? <h2>Loading...</h2> : <h2>Error Fetching Images</h2>
            }
        </>
    );
}
