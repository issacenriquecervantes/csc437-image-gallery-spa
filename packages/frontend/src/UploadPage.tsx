import { useId, useState } from "react";

interface IUploadPageProps {
    token: string;
}

export function UploadPage(props: IUploadPageProps) {

    const imageId = useId()

    const [dataURL, setDataURL] = useState<string | undefined>();
    const [uploadName, setUploadName] = useState("")
    const [uploadImage, setUploadImage] = useState<File | undefined>()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function readAsDataURL(file: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = (err) => reject(err);
        });
    }

    async function handleSubmitPressed(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const formData = new FormData();
            if (uploadImage) {
                formData.append("image", uploadImage);
            }
            formData.append("name", uploadName);

            const response = await fetch(
                `/api/images`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${props.token}`,
                    },
                    body: formData,
                }
            );
            if (!response.ok) {
                setError("Failed to upload image.");
            } else {
                setError("Upload was success.");
            }
        } catch (e) {
            if (!error) setError("Network error.");
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h2>Upload</h2>
            <form onSubmit={handleSubmitPressed}>
                <div>
                    <label htmlFor={imageId}>Choose image to upload: </label>
                    <input
                        id={imageId}
                        name="image"
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        required
                        onChange={(e) => {
                            if (!e.target.files) {
                                setDataURL("")
                            } else {
                                readAsDataURL(e.target.files[0]).then((res) => setDataURL(res));
                                setUploadImage(e.target.files[0]);
                            }
                        }}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label>
                        <span>Image title: </span>
                        <input name="name" required disabled={loading} onChange={(e) => setUploadName(e.target.value)} />
                    </label>
                </div>

                <div> {/* Preview img element */}
                    <img style={{ width: "20em", maxWidth: "100%" }} src={dataURL} alt="" />
                </div>

                <input type="submit" value="Confirm upload" disabled={loading} />
            </form>
            {!loading && error && (
                <div aria-live="polite" style={{ color: "red", marginTop: "1em" }}>
                    {error}
                </div>
            )}
        </>
    );
}
