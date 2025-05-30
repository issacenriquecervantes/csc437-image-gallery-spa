import { Link } from "react-router";
import "./Images.css";
import {type IImageData} from "../../../backend/src/ImageProvider.ts"

interface IImageGridProps {
    images: IImageData[];
}

export function ImageGrid(props: IImageGridProps) {
    const imageElements = props.images.map((image) => (
        <div key={image._id.toString()} className="ImageGrid-photo-container">
            <Link to={"/images/" + image._id}><img src={image.src} alt={image.name} /></Link>
        </div>
    ));
    return (
        <div className="ImageGrid">
            {imageElements}
        </div>
    );
}
