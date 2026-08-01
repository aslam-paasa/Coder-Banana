import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorState';
import NextImage from 'next/image';

const ImageEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { image } = useEditorStore();

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (!image) return;
        const img = new Image();
        img.src = image;

        img.onload = () => {
            /* set canvas size to image size */
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            /* clear the canvas */
            ctx.clearRect(0, 0, canvas!.width, canvas!.height);
            
            /* draw the image */
            ctx.drawImage(img, 0, 0);
        }
    }, [image])

    useEffect(() => {
        if (!image) return;

        const img = new Image();
        img.src = image;

        img.onload = () => {
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
