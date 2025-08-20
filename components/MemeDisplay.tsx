import React, { useRef, useCallback, useState } from 'react';
import type { Meme } from '../types';
import { MemeActions } from './MemeActions';
import { Spinner } from './Spinner';

interface MemeDisplayProps {
  meme: Meme;
  isAdminView: boolean;
  isRefining: boolean;
  onApprove: () => void;
  onReact: (emoji: string) => void;
  onComment: (comment: string) => void;
  onRefine: (prompt: string) => void;
}

const textStyles: React.CSSProperties = {
  WebkitTextStroke: '2px black',
  textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
};

export const MemeDisplay: React.FC<MemeDisplayProps> = ({ 
    meme, isAdminView, isRefining, onApprove, onReact, onComment, onRefine
}) => {
  const memeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [refinePrompt, setRefinePrompt] = useState('');

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinePrompt.trim() && !isRefining) {
        onRefine(refinePrompt.trim());
    }
  }

  const drawTextOnCanvas = useCallback((
    ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
    maxWidth: number, lineHeight: number, isTop: boolean
  ) => {
    if (!text) return;
    const words = text.toUpperCase().split(' ');
    let line = '';
    const lines = [];
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    if (isTop) {
        for (let i = 0; i < lines.length; i++) {
            ctx.strokeText(lines[i].trim(), x, y + (i * lineHeight));
            ctx.fillText(lines[i].trim(), x, y + (i * lineHeight));
        }
    } else {
        for (let i = 0; i < lines.length; i++) {
            const currentY = y - ((lines.length - 1 - i) * lineHeight);
            ctx.strokeText(lines[i].trim(), x, currentY);
            ctx.fillText(lines[i].trim(), x, currentY);
        }
    }
  }, []);

  const drawOnCanvas = useCallback((
    image: HTMLImageElement, canvas: HTMLCanvasElement, resolve: (blob: Blob | null) => void
  ) => {
    const { topText, bottomText } = meme;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    ctx.drawImage(image, 0, 0);

    const fontSize = (canvas.width / 10);
    ctx.font = `bold ${fontSize}px Anton, sans-serif`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = fontSize / 15;
    ctx.textAlign = 'center';
    
    const maxWidth = canvas.width * 0.9;
    const x = canvas.width / 2;
    const lineHeight = fontSize * 1.1;

    ctx.textBaseline = 'top';
    const topY = canvas.height * 0.05;
    drawTextOnCanvas(ctx, topText, x, topY, maxWidth, lineHeight, true);

    ctx.textBaseline = 'bottom';
    const bottomY = canvas.height * 0.95;
    drawTextOnCanvas(ctx, bottomText, x, bottomY, maxWidth, lineHeight, false);

    canvas.toBlob((blob) => { resolve(blob); }, 'image/png');
  }, [meme, drawTextOnCanvas]);

  const generateMemeBlob = useCallback(async (): Promise<Blob | null> => {
    if (!imageRef.current || !meme) return null;

    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const image = imageRef.current!;
        image.crossOrigin = 'anonymous'; 
        
        const performDraw = () => drawOnCanvas(image, canvas, resolve);

        if (image.complete && image.naturalHeight !== 0) {
            performDraw();
        } else {
            image.onload = performDraw;
            image.onerror = () => resolve(null);
            if (image.src !== meme.imageUrl) {
                image.src = meme.imageUrl;
            }
        }
    });
  }, [meme, drawOnCanvas]);
  
  const downloadMeme = useCallback(async () => {
    const blob = await generateMemeBlob();
    if (blob) {
      const link = document.createElement('a');
      link.download = 'memepulse-meme.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }, [generateMemeBlob]);

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl w-full flex flex-col items-center p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-4 w-full">
            <div ref={memeRef} className="relative w-full max-w-lg aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-900">
                <img ref={imageRef} src={meme.imageUrl} alt="Generated meme" className="w-full h-full object-contain" crossOrigin="anonymous"/>
                {meme.topText && <p className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] font-meme text-4xl md:text-5xl text-white uppercase tracking-wide text-center" style={textStyles}>{meme.topText}</p>}
                {meme.bottomText && <p className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] font-meme text-4xl md:text-5xl text-white uppercase tracking-wide text-center" style={textStyles}>{meme.bottomText}</p>}
                
                {isAdminView && !meme.isApproved && (
                    <div className="absolute top-2 right-2 bg-google-yellow text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                        Pending Approval
                    </div>
                )}
            </div>

            <div className="w-full max-w-lg text-xs text-center text-gray-500 dark:text-dark-text-secondary">
                Inspired by: <a href={meme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-google-blue transition-colors">{meme.sourceUrl}</a>
            </div>
            
            {isAdminView && !meme.isApproved && (
                <div className="w-full max-w-lg space-y-3 p-4 bg-neutral-100 dark:bg-black/20 rounded-lg border border-neutral-200 dark:border-dark-border">
                    <form onSubmit={handleRefineSubmit} className="space-y-2">
                        <label htmlFor={`refine-${meme.id}`} className="block text-sm font-semibold text-gray-800 dark:text-dark-text-primary">Refine This Meme</label>
                        <div className="flex items-center space-x-2">
                           <input
                            id={`refine-${meme.id}`}
                            type="text"
                            value={refinePrompt}
                            onChange={(e) => setRefinePrompt(e.target.value)}
                            placeholder="e.g., 'Make it about synergy'"
                            disabled={isRefining}
                            className="flex-grow p-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-google-blue transition-colors duration-200 placeholder-gray-500 dark:placeholder-dark-text-secondary dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-800"
                           />
                           <button type="submit" disabled={isRefining || !refinePrompt.trim()} className="flex items-center justify-center w-28 px-4 py-2 bg-google-blue text-white font-semibold rounded-lg hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow hover:shadow-lg">
                             {isRefining ? <Spinner /> : 'Refine'}
                           </button>
                        </div>
                    </form>

                    <button
                        onClick={onApprove}
                        disabled={isRefining}
                        className="w-full py-2.5 px-4 bg-google-green text-white font-semibold rounded-lg shadow hover:shadow-lg hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-100 dark:focus:ring-offset-black/20 focus:ring-google-green disabled:bg-gray-400"
                    >
                        Approve Meme
                    </button>
                </div>
            )}

            <div className="w-full max-w-lg border-t border-neutral-200 dark:border-dark-border pt-4">
                <MemeActions 
                    onDownload={downloadMeme}
                    generateMemeBlob={generateMemeBlob}
                    reactions={meme.reactions}
                    userReaction={meme.userReaction}
                    onReact={onReact}
                    onComment={onComment}
                />
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">Comments ({meme.comments.length})</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {meme.comments.length > 0 ? meme.comments.map((comment, index) => (
                            <div key={index} className="bg-neutral-100 dark:bg-black/20 p-3 rounded-lg text-sm text-gray-800 dark:text-dark-text-primary">{comment}</div>
                        )) : (
                            <p className="text-gray-500 dark:text-dark-text-secondary text-sm">No comments yet. Be the first!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};