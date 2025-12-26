import type { ComponentType } from 'react';

declare module 'react-grid-layout/legacy' {
    export interface Layout {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
        minW?: number;
        minH?: number;
        maxW?: number;
        maxH?: number;
        static?: boolean;
        isDraggable?: boolean;
        isResizable?: boolean;
    }

    export interface GridLayoutProps {
        className?: string;
        style?: React.CSSProperties;
        width: number;
        autoSize?: boolean;
        cols?: number;
        draggableCancel?: string;
        draggableHandle?: string;
        compactType?: 'vertical' | 'horizontal' | null;
        layout?: Layout[];
        margin?: [number, number];
        containerPadding?: [number, number];
        rowHeight?: number;
        maxRows?: number;
        isBounded?: boolean;
        isDraggable?: boolean;
        isResizable?: boolean;
        isDroppable?: boolean;
        preventCollision?: boolean;
        useCSSTransforms?: boolean;
        transformScale?: number;
        resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
        resizeHandle?: React.ReactNode | ((resizeHandleAxis: string, ref: React.Ref<HTMLElement>) => React.ReactNode);
        onLayoutChange?: (layout: Layout[]) => void;
        onDragStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
        onDrag?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
        onDragStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
        onResizeStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
        onResize?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
        onResizeStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
        onDrop?: (layout: Layout[], item: Layout, e: DragEvent) => void;
        onDropDragOver?: (e: DragEvent) => { w?: number; h?: number } | false;
        children?: React.ReactNode;
    }

    const GridLayout: ComponentType<GridLayoutProps>;
    export default GridLayout;
}
