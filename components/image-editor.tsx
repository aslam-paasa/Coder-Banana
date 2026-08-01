import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorState';
import NextImage from 'next/image';

const ImageEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const { image } = useEditorStore();

    const draw = useCallback(() => {
        if (!canvasRef.current) return;

        /* get canvas context */
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx || !imgRef.current) return;

        /* clear the canvas */
        ctx.clearRect(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
        );

        /* draw the image */
        ctx.drawImage(imgRef.current, 0, 0);
    }, [image])

    /* Initial image load */
    useEffect(() => {
        if (!image) return;

        /* create new image */
        const img = new Image();
        img.src = image;

        /* load image, set image on canvas and draw */
        img.onload = () => {
            imgRef.current = img;

            /* set canvas size to image size */
            canvasRef.current!.width = img.naturalWidth;
            canvasRef.current!.height = img.naturalHeight;

            draw();
        }
    }, [image, draw])

    return (
        <div className='w-full h-full flex items-center justify-center'>
            <canvas
                ref={canvasRef}
                className='max-w-full max-h-full'></canvas>
            {/* <NextImage
                width={500}
                height={500}
                src={image as string}
                alt=""
            /> */}
        </div>
    )
}

export default ImageEditor
