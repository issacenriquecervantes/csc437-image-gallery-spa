import express, { Request, Response } from "express";
import { CredentialsProvider } from "../CredentialsProvider";

import jwt from "jsonwebtoken";

export interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, credentialsProvider: CredentialsProvider) {

    app.post("/auth/register", async (req: Request, res: Response) => {

        const { username, password } = req.body;

        if (username === undefined || password === undefined) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
            return;
        }

        try {
            const registeredSuccessfully = await credentialsProvider.registerUser(username, password)

            if (!registeredSuccessfully) {
                res.status(409).send({
                    error: "Bad request",
                    message: "Username already exists."
                })
            } else {
                const token = await generateAuthToken(username, req.app.locals.JWT_SECRET)
                res.status(201).send(token)
            }
        } catch (err) {
            res.status(500).send({ error: "Internal Server Error", message: "Failed to register user." });
        }

    });

    app.post("/auth/login", async (req: Request, res: Response) => {

        const { username, password } = req.body;

        if (username === undefined || password === undefined) {
            res.status(400).send({
                error: "Bad request",
                message: "Missing username or password"
            });
            return;
        }

        try {

            const verified = await credentialsProvider.verifyPassword(username, password)

            if (!verified) {

                res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password."
                })
            }

            else {
                const token = await generateAuthToken(username, req.app.locals.JWT_SECRET)
                res.send(token)
            }

        }
        catch (err) {
            res.status(500).send({ error: "Internal Server Error", message: "Failed to register user." });
        }

    })



}