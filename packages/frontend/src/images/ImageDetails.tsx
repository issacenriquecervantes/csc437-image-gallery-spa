import {type IImageData} from "../../../backend/src/shared/ApiImageData.ts"
import { useParams } from "react-router";
import { ImageNameEditor } from "./ImageNameEditor.tsx"

export function ImageDetails(props: {
    errorFetchingData: boolean;
    fetchingData: boolean;
    imageData: IImageData[];
    onNameChange: (imageId: string, newName: string) => void;
}) {
    const { imageID } = useParams();
    const image = props.imageData.find(image => image._id.toString() === imageID);

    return (
        props.fetchingData === false && props.errorFetchingData == false ?
            (
                !image ? (
                    <h2>Image Not Found</h2>
                ) : (
                    <>
                        <h2>{image.name}</h2>
                        <p>By {image.author.username}</p>
                        <ImageNameEditor
                            initialValue={image.name}
                            imageId={image._id.toString()}
                            onNameChange={props.onNameChange}
                        />
                        <img className="ImageDetails-img" src={image.src} alt={image.name} />
                    </>
                )
            ) : props.fetchingData === true ? <h2>Loading...</h2> : <h2>Error Fetching Images</h2>
    );
}
