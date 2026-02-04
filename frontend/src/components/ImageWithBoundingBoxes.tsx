import { useRef, useEffect, useState } from 'react';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface BoxWithLabel {
  boundingBox: BoundingBox;
  itemName: string;
}

interface ImageWithBoundingBoxesProps {
  imageUrl: string;
  boxes: BoxWithLabel[];
  className?: string;
  onClick?: () => void;
}

export default function ImageWithBoundingBoxes({
  imageUrl,
  boxes,
  className = '',
  onClick,
}: ImageWithBoundingBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const boxesToDraw = boxes.filter((b) => b.boundingBox);

  useEffect(() => {
    if (boxesToDraw.length === 0 || !canvasRef.current || !containerRef.current || !imgRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvas = () => {
      const imgRect = img.getBoundingClientRect();
      if (imgRect.width === 0 || imgRect.height === 0) {
        requestAnimationFrame(updateCanvas);
        return;
      }

      canvas.width = imgRect.width;
      canvas.height = imgRect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      boxesToDraw.forEach(({ boundingBox, itemName: _ }) => {
        const x = boundingBox.x * canvas.width;
        const y = boundingBox.y * canvas.height;
        const width = boundingBox.width * canvas.width;
        const height = boundingBox.height * canvas.height;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(x, y, width, height);

        const cornerSize = Math.max(6, Math.min(12, width * 0.1));
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x - cornerSize / 2, y - cornerSize / 2, cornerSize, cornerSize);
        ctx.fillRect(x + width - cornerSize / 2, y - cornerSize / 2, cornerSize, cornerSize);
        ctx.fillRect(x - cornerSize / 2, y + height - cornerSize / 2, cornerSize, cornerSize);
        ctx.fillRect(x + width - cornerSize / 2, y + height - cornerSize / 2, cornerSize, cornerSize);
      });
    };

    const timeoutId = setTimeout(updateCanvas, 100);
    return () => clearTimeout(timeoutId);
  }, [boxesToDraw, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <img
        ref={imgRef}
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover rounded-lg"
        onLoad={handleImageLoad}
      />
      {boxesToDraw.length > 0 && imageLoaded && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />
      )}
    </div>
  );
}
