import React, { useState } from "react";
import "./LoginPage.css";
import { Link } from "react-router";

interface ILoginProps {
    isRegistering: boolean;
    handleAuthToken: (generatedToken: string) => void;
}

export function LoginPage(props: ILoginProps) {
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    let [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        setIsPending(true)
        setErrorMsg(null)

        e.preventDefault();

        setTimeout(() =>
            props.isRegistering ? registerUser() : loginUser()
            , 5000);
    }

    const registerUser = () => {
        fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password }),
        }).then(async (response) => {
            if (response.ok) {
                console.log("Successfully created account");
                const token = await response.text();
                if (props.handleAuthToken) {
                    props.handleAuthToken(token);
                }
                setErrorMsg(null);
            } else {
                if (response.status === 409) {
                    setErrorMsg("Username already exists. Please try again with a different username.");
                } else {
                    setErrorMsg("Registration failed. Please try again.");
                }
            }
            setIsPending(false);
            return response;
        }).catch((err) => {
            setErrorMsg("Registration failed. Please try again.");
            setIsPending(false);
            console.error("Failed to register account.", err);
        })
    }

    const loginUser = () => {
        fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: username, password: password }),
        }).then(async (response) => {
            if (response.ok) {
                console.log("Successfully logged in account");
                const token = await response.text();
                if (props.handleAuthToken) {
                    props.handleAuthToken(token);
                }
                setErrorMsg(null);
            } else {
                if (response.status === 401) {
                    setErrorMsg("Username or password were incorrect. Please try again.");
                } else {
                    setErrorMsg("Login failed. Please try again.");
                }
            }
            setIsPending(false);
            return response;
        }).catch((err) => {
            setErrorMsg("Login failed. Please try again.");
            setIsPending(false);
            console.error("Failed to log in account.", err);
        })
    }

    return (
        <>
            {props.isRegistering ? <h2>Register a new account</h2> : <h2>Login</h2>}
            {!props.isRegistering && <p>Don't have an account? <Link to={"/register"}>Register here</Link></p>}
            <form className="LoginPage-form" onSubmit={handleSubmit}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} required onChange={(e) => setUsername(e.target.value)} disabled={isPending} />

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} type="password" required onChange={(e) => setPassword(e.target.value)} disabled={isPending} />

                <input type="submit" value="Submit" disabled={isPending} />
            </form>
            {!isPending && errorMsg && (
                <div aria-live="polite" style={{ color: "red", marginTop: "1em" }}>
                    {errorMsg}
                </div>
            )}
        </>
    );
}
