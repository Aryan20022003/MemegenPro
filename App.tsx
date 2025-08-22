import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MemeDisplay } from './components/MemeDisplay';
import { CreateMemeView } from './components/CreateMemeView';
import { generateMemeFromTemplate } from './services/geminiService';
import type { Meme } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { Spinner } from './components/Spinner';

const ARTICLE_URL = 'https://gn.corp.google.com/article/4996332896661603378';
const ARTICLE_CONTENT = `
Subject: Project Phoenix: Q3 Soars to New Heights!

Team,

What a quarter! I'm thrilled to share the incredible progress we've made on Project Phoenix. Our cross-functional synergy has been off the charts, and the metrics speak for themselves. We've successfully shifted the paradigm and leveraged our core competencies to achieve a 150% increase in user engagement.

Key wins:
- Deployed the new "Synergizer" module ahead of schedule. Thanks to the "Tiger Team" for burning the midnight oil on that one!
- Onboarded three new enterprise clients, expanding our market footprint significantly.
- Our Q3 "Innovation Jam" resulted in over 50 new feature ideas. We're now in the process of circling back to actionize the low-hanging fruit.

Let's keep this momentum going as we head into Q4. Remember to touch base and align on our strategic imperatives. Let's double-click on our goals and ensure we're all singing from the same hymn sheet.

Onwards and upwards!
`;

const OwlIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.25,4.21C12.13,4.17 12.05,4.1 12,4.09C11.95,4.1 11.87,4.17 11.75,4.21C11.75,4.21 11.74,4.21 11.74,4.21C8.83,5.12 6.88,7.82 6.88,10.94C6.88,11.05 6.89,11.17 6.9,11.28L6.2,12.35C5.89,12.93 6.06,13.67 6.6,14.12C6.6,14.12 6.6,14.12 6.6,14.12C6.91,14.39 7.3,14.53 7.69,14.53C7.94,14.53 8.19,14.47 8.43,14.34L9.94,13.5L10.38,14.56C10.58,15.11 11.04,15.54 11.59,15.69C11.73,15.73 11.87,15.75 12,15.75C12.13,15.75 12.27,15.73 12.41,15.69C12.96,15.54 13.42,15.11 13.62,14.56L14.06,13.5L15.57,14.34C15.81,14.47 16.06,14.53 16.31,14.53C16.7,14.53 17.09,14.39 17.4,14.12C17.94,13.67 18.11,12.93 17.8,12.35L17.1,11.28C17.11,11.17 17.12,11.05 17.12,10.94C17.12,7.82 15.17,5.12 12.26,4.21L12.25,4.21M12,2C12.55,2 13,2.45 13,3C13,3.55 12.55,4 12,4C11.45,4 11,3.55 11,3C11,2.45 11.45,2 12,2M12,5.91C14.06,6.54 15.5,8.54 15.5,10.94C15.5,11.08 15.49,11.22 15.47,11.36L15.93,12.13C16,12.25 15.95,12.42 15.83,12.5C15.7,12.6 15.53,12.59 15.42,12.47L13.1,11.21L12.8,12.05C12.69,12.33 12.36,12.49 12.06,12.42C11.9,12.38 11.77,12.26 11.7,12.11L11.2,11.21L8.58,12.47C8.47,12.59 8.3,12.6 8.17,12.5C8.05,12.42 8,12.25 8.07,12.13L8.53,11.36C8.51,11.22 8.5,11.08 8.5,10.94C8.5,8.54 9.94,6.54 12,5.91M4,13C4,13 4,13 4,13C3.45,13 3,13.45 3,14C3,14.55 3.45,15 4,15H5V17C5,18.1 5.9,19 7,19H8V20C8,20.55 8.45,21 9,21C9.55,21 10,20.55 10,20V19H14V20C14,20.55 14.45,21 15,21C15.55,21 16,20.55 16,20V19H17C18.1,19 19,18.1 19,17V15H20C20.55,15 21,14.55 21,14C21,13.45 20.55,13 20,13H19V11.27C19.97,12.03 20.62,13.12 20.86,14.34C20.95,14.8 20.63,15.26 20.18,15.35C19.72,15.44 19.26,15.12 19.17,14.66C18.89,13.26 18.11,12.03 17,11.13V17C17,17.55 16.55,18 16,18H8C7.45,18 7,17.55 7,17V11.13C5.89,12.03 5.11,13.26 4.83,14.66C4.74,15.12 4.28,15.44 3.82,15.35C3.37,15.26 3.05,14.8 3.14,14.34C3.38,13.12 4.03,12.03 5,11.27V13H4Z"></path>
    </svg>
);

const App: React.FC = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(true);
  const [refiningMemeId, setRefiningMemeId] = useState<string | null>(null);
  const [view, setView] = useState<'feed' | 'create'>('feed');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleInitialGenerateMeme = useCallback(async () => {
    setIsGenerating(true);
    setInitialLoading(true);
    setError(null);

    try {
      setLoadingMessage('Crafting the perfect meme...');
      const memeData = await generateMemeFromTemplate(ARTICLE_CONTENT);
      
      const newMeme: Meme = {
        id: Date.now().toString(),
        imageUrl: memeData.imageUrl,
        sourceUrl: ARTICLE_URL,
        reactions: { '👍': 0, '❤️': 0, '😂': 0 },
        comments: [],
        userReaction: null,
        isApproved: false,
        isAutoGenerated: false,
      };
      setMemes(prev => [newMeme, ...prev]);

    } catch (err) {
      console.error(err);
      setError('Failed to generate meme. The AI might be on a coffee break. Please try again.');
    } finally {
      setIsGenerating(false);
      setInitialLoading(false);
      setLoadingMessage('');
    }
  }, []);

  useEffect(() => {
    if (memes.length === 0) {
      handleInitialGenerateMeme();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefineMeme = useCallback(async (memeId: string, prompt: string) => {
    setRefiningMemeId(memeId);
    setError(null);
    try {
      const refinedMemeData = await generateMemeFromTemplate(ARTICLE_CONTENT, prompt);
      setMemes(memes => memes.map(m => 
        m.id === memeId 
        ? { 
            ...m, 
            imageUrl: refinedMemeData.imageUrl,
            isApproved: false // Reset approval status after refining
          } 
        : m
      ));
    } catch (err) {
      console.error(err);
      setError('Failed to refine meme. The AI might be pondering harder. Please try again.');
    } finally {
      setRefiningMemeId(null);
    }
  }, []);

  const handleApproveMeme = useCallback((memeId: string) => {
    setMemes(memes => memes.map(m => (m.id === memeId ? { ...m, isApproved: true } : m)));
  }, []);

  const handleReaction = useCallback((memeId: string, emoji: string) => {
    setMemes(memes => memes.map(m => {
      if (m.id !== memeId) return m;
      const newReactions = { ...m.reactions };
      let newUserReaction = m.userReaction;

      if (m.userReaction === emoji) {
        newReactions[emoji]--;
        newUserReaction = null;
      } else {
        if (m.userReaction) {
          newReactions[m.userReaction]--;
        }
        newReactions[emoji]++;
        newUserReaction = emoji;
      }
      return { ...m, reactions: newReactions, userReaction: newUserReaction };
    }));
  }, []);

  const handleAddComment = useCallback((memeId: string, comment: string) => {
    setMemes(memes => memes.map(m =>
      m.id === memeId ? { ...m, comments: [...m.comments, comment] } : m
    ));
  }, []);
  
  const handleMemeCreated = useCallback((newMeme: Meme) => {
    setMemes(prev => [newMeme, ...prev]);
    setView('feed');
  }, []);

  const visibleMemes = isAdminView ? memes : memes.filter(m => m.isApproved);

  const renderFeedContent = () => {
    if (initialLoading && memes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
          <Spinner />
          <p className="mt-4 text-lg text-google-blue">{loadingMessage || 'Brewing up the first meme...'}</p>
        </div>
      );
    }

    if (error && memes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
              <div className="text-5xl mb-4">🤷</div>
              <p className="text-xl font-semibold text-google-red">{`Oops, something went wrong!`}</p>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-2">{error}</p>
            </div>
          );
    }
    
    return (
        <div className="space-y-12">
            {visibleMemes.length > 0 ? (
                 visibleMemes.map(meme => (
                    <MemeDisplay
                      key={meme.id}
                      meme={meme}
                      isAdminView={isAdminView}
                      isRefining={refiningMemeId === meme.id}
                      onApprove={() => handleApproveMeme(meme.id)}
                      onReact={(emoji) => handleReaction(meme.id, emoji)}
                      onComment={(comment) => handleAddComment(meme.id, comment)}
                      onRefine={(prompt) => handleRefineMeme(meme.id, prompt)}
                    />
                  ))
            ) : (
                <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-dark-text-primary">The Meme Feed is Empty!</h3>
                    <p className="text-gray-500 dark:text-dark-text-secondary mt-2">
                        {isAdminView ? "Try generating a new meme!" : "No memes have been approved yet. Check back soon!"}
                    </p>
                </div>
            )}
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
         <div className="absolute bottom-4 right-4 opacity-0 dark:opacity-100 transition-opacity duration-500">
            <OwlIcon className="w-32 h-32 text-gray-500/10" />
         </div>
      </div>
      <Header isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      <main className="flex-grow container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {view === 'feed' ? (
            <>
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="flex items-center space-x-2 p-1 rounded-full bg-neutral-200 dark:bg-dark-card self-center">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${!isAdminView ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-dark-text-secondary'}`}>User</span>
                    <label htmlFor="view-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="view-toggle" className="sr-only peer" checked={isAdminView} onChange={() => setIsAdminView(!isAdminView)} />
                        <div className="w-11 h-6 bg-gray-400 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-google-blue"></div>
                    </label>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${isAdminView ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-600 dark:text-dark-text-secondary'}`}>Admin</span>
                </div>

                {isAdminView && (
                  <button
                    onClick={() => setView('create')}
                    disabled={isGenerating || !!refiningMemeId}
                    className="flex items-center justify-center px-5 py-2.5 bg-google-blue text-white font-semibold rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none animate-pulse-glow disabled:animate-none"
                  >
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Create New Meme
                  </button>
                )}
              </div>

              {renderFeedContent()}
            </>
          ) : (
            <CreateMemeView 
              onMemeCreated={handleMemeCreated}
              onCancel={() => setView('feed')}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;