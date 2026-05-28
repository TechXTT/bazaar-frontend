import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization") ?? "";
    const contentType = req.headers.get("content-type") ?? "";

    const body = await req.arrayBuffer();

    const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        headers: {
            Authorization: authHeader,
            "Content-Type": contentType,
        },
        body,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}
