const FONT_FAMILY = 'Anton, sans-serif';

function drawTextLines(
    ctx: CanvasRenderingContext2D, text: string, x: number, y: number,
    maxWidth: number, lineHeight: number, isTop: boolean
) {
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
        for (let i = lines.length - 1; i >= 0; i--) {
            const currentY = y - ((lines.length - 1 - i) * lineHeight);
            ctx.strokeText(lines[i].trim(), x, currentY);
            ctx.fillText(lines[i].trim(), x, currentY);
        }
    }
}

export async function renderMemeOnCanvas(
    templateUrl: string, topText: string, bottomText: string
): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = templateUrl;
        console.log(image.src);

        image.onload = () => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;

            ctx.drawImage(image, 0, 0);

            const fontSize = (canvas.width / 15);
            ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = fontSize / 15;
            ctx.textAlign = 'center';
            
            const maxWidth = canvas.width * 0.9;
            const x = canvas.width / 2;
            const lineHeight = fontSize * 1.1;

            ctx.textBaseline = 'top';
            const topY = canvas.height * 0.05;
            drawTextLines(ctx, topText, x, topY, maxWidth, lineHeight, true);

            ctx.textBaseline = 'bottom';
            const bottomY = canvas.height * 0.95;
            drawTextLines(ctx, bottomText, x, bottomY, maxWidth, lineHeight, false);

            resolve(canvas);
        };

        image.onerror = () => {
            reject(new Error('Failed to load meme template image.'));
        };
    });
}

export async function convertCanvasToDataUrl(canvas: HTMLCanvasElement): Promise<string> {
    return canvas.toDataURL('image/png');
}