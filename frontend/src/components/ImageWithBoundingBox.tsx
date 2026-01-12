import { useRef, useEffect, useState } from 'react';

interface BoundingBox {
  x: number; // Normalized (0-1)
  y: number; // Normalized (0-1)
  width: number; // Normalized (0-1)
  height: number; // Normalized (0-1)
}

interface ImageWithBoundingBoxProps {
  imageUrl: string;
  boundingBox?: BoundingBox;
  itemName: string;
  className?: string;
  onClick?: () => void;
}

export default function ImageWithBoundingBox({
  imageUrl,
  boundingBox,
  itemName,
  className = '',
  onClick,
}: ImageWithBoundingBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!boundingBox || !canvasRef.current || !containerRef.current || !imgRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wait for container to have dimensions
    const updateCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(updateCanvas);
        return;
      }

      // Set canvas to match displayed image size
      const imgRect = img.getBoundingClientRect();
      canvas.width = imgRect.width;
      canvas.height = imgRect.height;

      // Convert normalized coordinates (0-1) directly to canvas pixel coordinates
      const x = boundingBox.x * canvas.width;
      const y = boundingBox.y * canvas.height;
      const width = boundingBox.width * canvas.width;
      const height = boundingBox.height * canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw red bounding box
      ctx.strokeStyle = '#ef4444'; // Red color
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      // Draw semi-transparent red fill
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // Semi-transparent red
      ctx.fillRect(x, y, width, height);

      // Draw corner markers for better visibility
      const cornerSize = Math.max(6, Math.min(12, width * 0.1));
      ctx.fillStyle = '#ef4444';
      
      // Top-left corner
      ctx.fillRect(x - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
      // Top-right corner
      ctx.fillRect(x + width - cornerSize/2, y - cornerSize/2, cornerSize, cornerSize);
      // Bottom-left corner
      ctx.fillRect(x - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
      // Bottom-right corner
      ctx.fillRect(x + width - cornerSize/2, y + height - cornerSize/2, cornerSize, cornerSize);
    };

    // Small delay to ensure image is rendered
    const timeoutId = setTimeout(updateCanvas, 100);
    return () => clearTimeout(timeoutId);
  }, [boundingBox, imageLoaded]);

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
        alt={itemName}
        className="w-full h-full object-cover rounded-lg"
        onLoad={handleImageLoad}
      />
      {boundingBox && imageLoaded && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />
      )}
    </div>
  );
}
