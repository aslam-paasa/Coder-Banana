import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const { imageBase64, prompt } = await request.json()

    // todo: send the image and prompt to model and send back generated image to user.

    return NextResponse.json({ imageBase64, prompt })
} 