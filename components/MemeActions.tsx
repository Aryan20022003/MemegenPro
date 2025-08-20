import React, { useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';

interface MemeActionsProps {
    onDownload: () => void;
    generateMemeBlob: () => Promise<Blob | null>;
    reactions: { [key: string]: number };
    userReaction: string | null;
    onReact: (emoji: string) => void;
    onComment: (comment: string) => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂'];

export const MemeActions: React.FC<MemeActionsProps> = ({ 
    onDownload, generateMemeBlob, reactions, userReaction, onReact, onComment 
}) => {
    const [isSharing, setIsSharing] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [shareError, setShareError] = useState<string | null>(null);

    const handleShare = async () => {
        setShareError(null);
        if (!navigator.share) {
            setShareError("Web Share API is not available on your browser.");
            return;
        }

        setIsSharing(true);
        const blob = await generateMemeBlob();
        setIsSharing(false);

        if (blob) {
            const file = new File([blob], 'corporate-meme.png', { type: 'image/png' });
            try {
                await navigator.share({
                    title: 'Corporate Meme',
                    text: 'Check out this meme I made!',
                    files: [file],
                });
            } catch (error) {
                console.error('Error sharing:', error);
                if ((error as Error).name !== 'AbortError') {
                    setShareError("Could not share the meme.");
                }
            }
        } else {
            setShareError("Could not generate meme image for sharing.");
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            onComment(commentText.trim());
            setCommentText('');
        }
    };
    
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between bg-cream/60 p-2 rounded-lg">
                <div className="flex items-center space-x-2">
                    {EMOJI_REACTIONS.map(emoji => (
                        <button 
                            key={emoji}
                            onClick={() => onReact(emoji)}
                            className={`px-3 py-1 rounded-full transition-all duration-200 text-xl flex items-center space-x-1 ${userReaction === emoji ? 'bg-dark-tan text-white scale-110' : 'bg-cream hover:bg-dark-tan/20'}`}
                            aria-label={`React with ${emoji}`}
                        >
                           <span>{emoji}</span>
                           <span className="text-sm font-bold">{reactions[emoji]}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                     <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex items-center justify-center p-2 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-tan focus:ring-blue-500 transition-all duration-200 disabled:bg-gray-400"
                        aria-label="Share meme"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex items-center justify-center p-2 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-tan focus:ring-green-500 transition-all duration-200"
                         aria-label="Download meme"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {shareError && <p className="text-xs text-red-500 text-center">{shareError}</p>}

            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                <input 
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a witty comment..."
                    className="flex-grow p-2 bg-cream border-2 border-dark-tan/40 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 placeholder-gray-500"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400" disabled={!commentText.trim()}>
                    Post
                </button>
            </form>
        </div>
    );
};
