import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type EditorState = {
    image: string | null;
    setImage: (imageData: string) => void
}

export const useEditorStore = create<EditorState>()(
    devtools((set) => ({
        image: null,
        setImage: (imageData: string) => set(() => ({ image: imageData })),
    }))
)