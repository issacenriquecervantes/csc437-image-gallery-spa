import { type IImageData } from "../MockAppData.ts";
import { useParams } from "react-router";


export function ImageDetails(props: { imageData: IImageData[]; }) {
    const { imageID } = useParams()
    const image = props.imageData.find(image => image.id === imageID);
    if (!image) {
        return <h2>Image not found</h2>
    }

    return (
        <>
            <h2>{image.name}</h2>
            <p>By {image.author.username}</p>
            <img className="ImageDetails-img" src={image.src} alt={image.name} />
        </>
    )
}
