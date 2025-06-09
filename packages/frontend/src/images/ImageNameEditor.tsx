import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNameChange: (imageId: string, newName: string) => void;
    token: string;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmitPressed() {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(
                `/api/images/edit/${props.imageId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${props.token}`,
                    },
                    body: JSON.stringify({ newName: input }),
                }
            );
            if (!response.ok) {
                if (response.status === 403) {
                    setError("You are not the owner of this image.");
                } else {
                    setError("Failed to update image name.");
                }
                throw new Error("Network response was not ok");
            }
            props.onNameChange(props.imageId, input);
            setIsEditingName(false);
        } catch (e) {
            // Only set error here if it's not already set
            if (!error) setError("Failed to update image name.");
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    if (isEditingName) {
        return (
            <div style={{ margin: "1em 0" }}>
                <label>
                    New Name{" "}
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                    />
                </label>
                <button
                    disabled={input.length === 0 || loading}
                    onClick={handleSubmitPressed}
                >
                    Submit
                </button>
                <button
                    onClick={() => setIsEditingName(false)}
                    disabled={loading}
                >
                    Cancel
                </button>
                {loading && <div>Working...</div>}
                {error && <div style={{ color: "red" }}>{error}</div>}
            </div>
        );
    } else {
        return (
            <div style={{ margin: "1em 0" }}>
                <button onClick={() => setIsEditingName(true)}>Edit name</button>
            </div>
        );
    }
}