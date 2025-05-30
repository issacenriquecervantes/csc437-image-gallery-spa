import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNameChange: (imageId: string, newName: string) => void;
}

export function ImageNameEditor(props: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(props.initialValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    async function handleSubmitPressed() {
        setLoading(true);
        try {
            const response = await fetch("/api/images");
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            props.onNameChange(props.imageId, input)
            setIsEditingName(false);
        } catch (e) {
            setError("Failed to update image name.");
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