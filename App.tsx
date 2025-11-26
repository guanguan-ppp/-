import React, { useState, useEffect, useRef } from 'react';
import { AlchemyElement, GameState } from './types';
import { fuseElements } from './services/geminiService';
import ElementCard from './components/ElementCard';

// Initial Basic Elements
const INITIAL_ELEMENTS: AlchemyElement[] = [
  { id: '1', name: 'Water', emoji: '💧' },
  { id: '2', name: 'Fire', emoji: '🔥' },
  { id: '3', name: 'Earth', emoji: '🌍' },
  { id: '4', name: 'Air', emoji: '💨' },
];

const App: React.FC = () => {
  const [inventory, setInventory] = useState<AlchemyElement[]>(INITIAL_ELEMENTS);
  const [selectedItems, setSelectedItems] = useState<AlchemyElement[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [lastDiscovery, setLastDiscovery] = useState<AlchemyElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inventory when new item added
  useEffect(() => {
    if (lastDiscovery && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [inventory.length, lastDiscovery]);

  const handleElementClick = (element: AlchemyElement) => {
    if (gameState === GameState.FUSING) return;

    // Check if already selected, if so deselect
    if (selectedItems.find(i => i.id === element.id)) {
      setSelectedItems(prev => prev.filter(i => i.id !== element.id));
      return;
    }

    // Add to selection
    const newSelection = [...selectedItems, element];
    setSelectedItems(newSelection);

    // If we have 2, trigger fusion
    if (newSelection.length === 2) {
      triggerFusion(newSelection[0], newSelection[1]);
    }
  };

  const triggerFusion = async (el1: AlchemyElement, el2: AlchemyElement) => {
    setGameState(GameState.FUSING);
    
    // Artificial delay for tension/animation if API is too fast
    const minTime = new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const [result, _] = await Promise.all([
        fuseElements(el1, el2),
        minTime
      ]);

      const newItem: AlchemyElement = {
        id: Date.now().toString(),
        name: result.name,
        emoji: result.emoji,
        isNew: true,
        parents: [el1.id, el2.id]
      };

      // Check if item already exists (optional, but good for gameplay)
      const existing = inventory.find(i => i.name === newItem.name && i.emoji === newItem.emoji);
      
      if (!existing) {
        setInventory(prev => [...prev, newItem]);
        setLastDiscovery(newItem);
        setGameState(GameState.SUCCESS);
      } else {
        // Just show the existing one as the result but don't add to inventory
        setLastDiscovery(existing);
        setGameState(GameState.SUCCESS);
      }

    } catch (e) {
      setGameState(GameState.ERROR);
    } finally {
      // Clear selection after a delay so user sees the result
      setTimeout(() => {
        setSelectedItems([]);
        setGameState(GameState.IDLE);
      }, 2000);
    }
  };

  const resetGame = () => {
    if(window.confirm("Restart logic? All discoveries will be lost.")) {
      setInventory(INITIAL_ELEMENTS);
      setSelectedItems([]);
      setLastDiscovery(null);
      setGameState(GameState.IDLE);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none p-4 border-b border-slate-700 bg-slate-900/95 backdrop-blur z-10 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="text-3xl animate-bounce-short">⚗️</div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Emoji Alchemy
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-400">
            Discovered: <span className="text-white">{inventory.length}</span>
          </span>
          <button 
            onClick={resetGame}
            className="text-xs bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-200 px-3 py-1.5 rounded transition-colors border border-slate-700"
          >
            Reset
          </button>
        </div>
      </header>

      {/* MAIN FUSION AREA */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-hidden">
        
        {/* Background Ambient Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        {/* Fusion Stage */}
        <div className="relative z-0 flex flex-col items-center gap-8 w-full max-w-lg">
          
          <div className="h-12 text-center">
            {gameState === GameState.FUSING ? (
              <span className="text-indigo-300 font-medium animate-pulse">Alchemy in progress...</span>
            ) : gameState === GameState.SUCCESS && lastDiscovery ? (
              <span className="text-green-400 font-bold animate-pop">
                 Created {lastDiscovery.name}!
              </span>
            ) : gameState === GameState.ERROR ? (
              <span className="text-red-400">Fizzle... Try something else.</span>
            ) : (
              <span className="text-slate-500">Select two elements to fuse</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 sm:gap-16">
            {/* Slot 1 */}
            <div className={`
              w-32 h-32 rounded-2xl border-4 border-dashed border-slate-700 
              flex items-center justify-center transition-all duration-300
              ${selectedItems[0] ? 'border-indigo-500 border-solid bg-slate-800 shadow-xl' : 'bg-slate-800/50'}
            `}>
              {selectedItems[0] ? (
                <div className="text-center animate-pop">
                  <div className="text-5xl mb-2">{selectedItems[0].emoji}</div>
                  <div className="text-sm font-medium">{selectedItems[0].name}</div>
                </div>
              ) : (
                <div className="text-slate-600 text-4xl opacity-20">+</div>
              )}
            </div>

            {/* Magic Connector */}
            <div className="relative">
              {gameState === GameState.FUSING && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <div className="w-12 h-12 border-4 border-t-indigo-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                 </div>
              )}
              <div className="text-2xl text-slate-600 font-bold">+</div>
            </div>

            {/* Slot 2 */}
             <div className={`
              w-32 h-32 rounded-2xl border-4 border-dashed border-slate-700 
              flex items-center justify-center transition-all duration-300
              ${selectedItems[1] ? 'border-indigo-500 border-solid bg-slate-800 shadow-xl' : 'bg-slate-800/50'}
            `}>
              {selectedItems[1] ? (
                 <div className="text-center animate-pop">
                  <div className="text-5xl mb-2">{selectedItems[1].emoji}</div>
                  <div className="text-sm font-medium">{selectedItems[1].name}</div>
                </div>
              ) : (
                <div className="text-slate-600 text-4xl opacity-20">+</div>
              )}
            </div>
          </div>
          
          {/* Result Display (Overlays when success) */}
          {gameState === GameState.SUCCESS && lastDiscovery && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-pop">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-2xl shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center min-w-[200px]">
                  <div className="text-6xl mb-4 animate-bounce-short">{lastDiscovery.emoji}</div>
                  <div className="text-2xl font-bold text-white mb-1">{lastDiscovery.name}</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-wider">New Discovery</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* INVENTORY PANEL */}
      <div className="flex-none bg-slate-800/90 backdrop-blur border-t border-slate-700 h-1/3 flex flex-col">
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Elements Library
          </h2>
          <span className="text-xs text-slate-500">Tap to select</span>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto inventory-scroll"
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {inventory.map((element) => (
              <ElementCard
                key={element.id}
                element={element}
                onClick={handleElementClick}
                isSelected={selectedItems.some(i => i.id === element.id)}
                disabled={gameState === GameState.FUSING}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;