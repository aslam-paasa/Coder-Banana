import { useEditorStore } from '@/store/useEditorState';
import Image from 'next/image';
import { useRef } from 'react';

const ImageEditor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { image } = useEditorStore();

    return (
        <div className='w-full h-full flex items-center justify-center'>
            <canvas
                ref={canvasRef}
                className='border border-red-400 max-w-full max-h-full'></canvas>
            {/* <Image
                width={500}
                height={500}
                src={image as string}
                alt=""
            /> */}
        </div>
    )
}

export default ImageEditor
