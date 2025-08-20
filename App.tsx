import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MemeDisplay } from './components/MemeDisplay';
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

const App: React.FC = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState<boolean>(true);
  const [refiningMemeId, setRefiningMemeId] = useState<string | null>(null);


  const handleGenerateMeme = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      setLoadingMessage('Crafting the perfect meme...');
      const memeData = await generateMemeFromTemplate(ARTICLE_CONTENT);
      
      const newMeme: Meme = {
        id: Date.now().toString(),
        imageUrl: memeData.imageUrl,
        topText: memeData.topText,
        bottomText: memeData.bottomText,
        sourceUrl: ARTICLE_URL,
        reactions: { '👍': 0, '❤️': 0, '😂': 0 },
        comments: [],
        userReaction: null,
        isApproved: false,
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
      handleGenerateMeme();
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
            topText: refinedMemeData.topText,
            bottomText: refinedMemeData.bottomText,
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

  const visibleMemes = isAdminView ? memes : memes.filter(m => m.isApproved);

  const renderContent = () => {
    if (initialLoading && memes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
          <Spinner />
          <p className="mt-4 text-lg text-indigo-600">{loadingMessage || 'Brewing up the first meme...'}</p>
        </div>
      );
    }

    if (error && memes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
              <div className="text-5xl mb-4">🤷</div>
              <p className="text-xl font-semibold text-red-500">Oops, something went wrong!</p>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
          );
    }
    
    return (
        <div className="space-y-8">
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
                <div className="text-center py-16">
                    <h3 className="text-2xl font-bold text-gray-700">The Meme Feed is Empty!</h3>
                    <p className="text-gray-500 mt-2">
                        {isAdminView ? "Try generating a new meme!" : "No memes have been approved yet. Check back soon!"}
                    </p>
                </div>
            )}
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream text-gray-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center space-x-2 p-1 rounded-full bg-light-tan self-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${!isAdminView ? 'bg-white shadow' : 'text-gray-600'}`}>User View</span>
                <label htmlFor="view-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="view-toggle" className="sr-only peer" checked={isAdminView} onChange={() => setIsAdminView(!isAdminView)} />
                    <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${isAdminView ? 'bg-white shadow' : 'text-gray-600'}`}>Admin View</span>
            </div>

            {isAdminView && (
              <button
                onClick={handleGenerateMeme}
                disabled={isGenerating || !!refiningMemeId}
                className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream focus:ring-indigo-500 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Generating...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate New Meme
                  </>
                )}
              </button>
            )}
          </div>

          {renderContent()}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
