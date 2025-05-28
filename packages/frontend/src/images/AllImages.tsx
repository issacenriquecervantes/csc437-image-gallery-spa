import type { IImageData } from "../MockAppData.ts";
import { ImageGrid } from "./ImageGrid.tsx";

export function AllImages(props: { imageData: IImageData[]; }) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={props.imageData} />
        </>
    );
}
