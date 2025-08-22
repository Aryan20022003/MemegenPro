import React, { useCallback, useState } from 'react';
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

export const MemeDisplay: React.FC<MemeDisplayProps> = ({ 
    meme, isAdminView, isRefining, onApprove, onReact, onComment, onRefine
}) => {
  const [refinePrompt, setRefinePrompt] = useState('');

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refinePrompt.trim() && !isRefining) {
        onRefine(refinePrompt.trim());
    }
  }
  
  const downloadMeme = useCallback(() => {
    const link = document.createElement('a');
    link.download = 'memepulse-meme.png';
    link.href = meme.imageUrl;
    link.click();
  }, [meme.imageUrl]);

  return (
    <div className="bg-white/20 dark:bg-black/30 backdrop-blur-lg border border-white/30 dark:border-gray-700 rounded-2xl w-full flex flex-col items-center pt-10 pb-4 px-1 sm:pt-12 sm:pb-6 sm:px-2 shadow-2xl">
        <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-full max-w-lg aspect-square overflow-hidden rounded-lg shadow-lg bg-gray-900">
                <img src={meme.imageUrl} alt="Generated meme" className="w-full h-full object-contain" />
                
                {isAdminView && !meme.isApproved && (
                    <div className="absolute top-2 right-2 bg-google-yellow text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                        Pending Approval
                    </div>
                )}
            </div>

            {meme.sourceUrl !== 'Custom User Input' && (
              <div className="w-full max-w-lg text-xs text-center text-gray-500 dark:text-dark-text-secondary">
                  Inspired by: <a href={meme.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-google-blue transition-colors">{meme.sourceUrl}</a>
              </div>
            )}
            
            {isAdminView && !meme.isApproved && (
                <div className="w-full max-w-lg space-y-3 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700">
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

            <div className="w-full max-w-lg border-t border-neutral-200 dark:border-dark-border pt-8">
                <MemeActions 
                    memeImageUrl={meme.imageUrl}
                    onDownload={downloadMeme}
                    reactions={meme.reactions}
                    userReaction={meme.userReaction}
                    onReact={onReact}
                    onComment={onComment}
                />
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">Comments ({meme.comments.length})</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {meme.comments.length > 0 ? meme.comments.map((comment, index) => (
                            <div key={index} className="bg-white/20 dark:bg-black/20 backdrop-blur-sm p-3 rounded-lg text-sm text-gray-800 dark:text-dark-text-primary">{comment}</div>
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