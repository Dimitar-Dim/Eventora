import { IEnv } from "@/types/IEnv";

export const env : IEnv = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

