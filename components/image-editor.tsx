import { useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/useEditorState';
import { ToolType } from '@/lib/constants';
import NextImage from 'next/image';
import { Point } from '@/types';

const MASK_WHITE_THRESHOLD = 10;

const ImageEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const startPosRef = useRef<Point>(null);
    const isDrawingRef = useRef<boolean>(false);

    const { image, selectedTool, brushSize, setMask, mask } = useEditorStore();

    const draw = useCallback(() => {
        if (!canvasRef.current) return;

        /* draw the image */
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx || !imgRef.current) return;

        ctx.clearRect(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
        );

        ctx.drawImage(imgRef.current, 0, 0);

        /* copy mask to overlay canvas */
        ctx.save()

        /* todo: change global alpha */
        const overlayCanvas = overlayCanvasRef.current;
        if (!overlayCanvas || !maskCanvasRef.current) return;

        const overlayCtx = overlayCanvas?.getContext("2d");
        if (!overlayCtx) return;

        overlayCtx.clearRect(
            0,
            0,
            overlayCanvas.width,
            overlayCanvas?.height
        );

        overlayCtx.drawImage(maskCanvasRef.current, 0, 0);

        /* Change white color to read (highlight) */
        const imageData = overlayCtx.getImageData(
            0,
            0,
            overlayCanvas.width,
            overlayCanvas.height
        );

        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // if white side
            if (data[i] > MASK_WHITE_THRESHOLD) {
                data[i] = 255;     // red
                data[i + 1] = 0;   // green
                data[i + 2] = 0;   // blue
                data[i + 3] = 128; // alpha
            } else {
                // if black side
                data[i + 3] = 0; // full transparent
            }
        }

        overlayCtx.putImageData(imageData, 0, 0);
        ctx.drawImage(overlayCanvas, 0, 0);

        ctx.restore();

    }, [])


    /* Initial image load, initialize mask canvas, layout canvas */
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

            /* prepare initial mask canvas */
            maskCanvasRef.current = document.createElement("canvas");
            maskCanvasRef.current.width = img.width;
            maskCanvasRef.current.height = img.height;

            const maskCtx = maskCanvasRef.current.getContext("2d");
            if (maskCtx) {
                maskCtx.fillStyle = "black";
                maskCtx.fillRect(
                    0,
                    0,
                    maskCanvasRef.current.width,
                    maskCanvasRef.current.height
                );
            }

            /* create overlay canvas */
            overlayCanvasRef.current = document.createElement("canvas");
            overlayCanvasRef.current.width = img.width;
            overlayCanvasRef.current.height = img.height;

            draw();
        }
    }, [image, draw])

    const startDrawing = (e: React.PointerEvent) => {
        if (selectedTool === ToolType.MOVE) return;
        if (e.pointerType !== "mouse") return;

        e.preventDefault()

        isDrawingRef.current = true;

        const pos = getPointerPosition(e);
        startPosRef.current = pos;

        if (selectedTool === ToolType.BRUSH || selectedTool === ToolType.ERASER) {
            updateMask(pos, pos);
        }
    }

    const updateMask = (start: Point, end: Point) => {
        if (!maskCanvasRef.current) return;

        const ctx = maskCanvasRef.current.getContext("2d");
        if (!ctx) return;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (selectedTool === ToolType.ERASER) {
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'black';
        } else if (selectedTool === ToolType.BRUSH) {
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'white';
        }

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    const getPointerPosition = (e: React.PointerEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };

        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
        const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

        return { x, y }
    }

    const drawMove = (e: React.PointerEvent) => {
        if (!isDrawingRef.current) return;

        const startPosition = startPosRef.current;
        if (!startPosition) return;

        e.preventDefault();

        const currentPosition = getPointerPosition(e);

        if (selectedTool === ToolType.BRUSH || selectedTool === ToolType.ERASER) {
            updateMask(startPosition, currentPosition);
            startPosRef.current = currentPosition;
        }

        draw();
    }

    const endDrawing = () => {
        isDrawingRef.current = false;

        // todo: prepare the mask to be base64 (dataurl)
        if (maskCanvasRef.current) {
            const dataUrl = maskCanvasRef.current.toDataURL('image/png');
            setMask(dataUrl);
        }
    }

    return (
        <div className='w-full h-full flex-col items-center justify-center'>
            {/* <canvas
                ref={maskCanvasRef}
                className='max-w-full max-h-full'></canvas> */}
            <canvas
                onPointerDown={startDrawing}
                onPointerMove={drawMove}
                onPointerUp={endDrawing}
                ref={canvasRef}
                className='max-w-full max-h-full'></canvas>

            {/* <canvas
                ref={overlayCanvasRef}
                className='max-w-full max-h-full'></canvas> */}
        </div>
    )
}

export default ImageEditor
