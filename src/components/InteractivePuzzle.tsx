import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, KeyRound, Unlock, Lock, RotateCcw, Search } from 'lucide-react';
import { Puzzle } from '../gameData';

interface InteractivePuzzleProps {
  session: number;
  puzzle: Puzzle;
  onSolve: (input: string) => void;
  isLoading: boolean;
}

export default function InteractivePuzzle({ session, puzzle, onSolve, isLoading }: InteractivePuzzleProps) {
  const [inputLocal, setInputLocal] = useState("");

  useEffect(() => {
    setInputLocal("");
  }, [puzzle]);

  // Session 2: Word Scramble
  if (session === 2) {
    const wordToScramble = puzzle.displayWord || puzzle.answers[0].toUpperCase();
    
    // Simple state to handle selected letters
    const [scrambledArray, setScrambledArray] = useState<{id: number, char: string, used: boolean}[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<{id: number, char: string}[]>([]);

    useEffect(() => {
      // Create scrambled sequence
      const arr = wordToScramble.split('').map((char, index) => ({ id: index, char, used: false }));
      // Fisher-Yates shuffle
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setScrambledArray(arr);
      setSelectedSlots([]);
    }, [puzzle, wordToScramble]);

    const handleSelect = (index: number) => {
      if (scrambledArray[index].used) return;
      const newArray = [...scrambledArray];
      newArray[index].used = true;
      setScrambledArray(newArray);
      setSelectedSlots([...selectedSlots, { id: newArray[index].id, char: newArray[index].char }]);
    };

    const handleDeselect = (slotIndex: number) => {
      const slot = selectedSlots[slotIndex];
      const newScrambled = [...scrambledArray];
      const origIndex = newScrambled.findIndex(item => item.id === slot.id);
      if (origIndex !== -1) newScrambled[origIndex].used = false;
      
      const newSelected = selectedSlots.filter((_, idx) => idx !== slotIndex);
      setSelectedSlots(newSelected);
      setScrambledArray(newScrambled);
    };

    const handleSubmit = () => {
      const formedWord = selectedSlots.map(s => s.char).join('');
      onSolve(formedWord);
    };

    return (
      <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-[#120c08]/80 border border-[#4a3624] rounded-lg mt-2 shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]" />
         <h3 className="text-[#e4d5b7] font-serif text-lg border-b border-[#c49b66]/30 pb-1 mb-4 uppercase tracking-widest relative z-10 w-full text-center">Rune Scramble</h3>
         
         {/* Drop slots */}
         <div className="flex flex-wrap gap-1 md:gap-2 mb-6 justify-center min-h-[40px] relative z-10">
           {Array.from({ length: wordToScramble.length }).map((_, i) => (
             <div 
                key={i} 
                onClick={() => selectedSlots[i] && handleDeselect(i)}
                className={`w-10 h-12 md:w-14 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold font-serif border-2 rounded ${selectedSlots[i] ? 'bg-[#c49b66] text-[#120c08] border-[#e4d5b7] cursor-pointer shadow-[0_0_15px_rgba(196,155,102,0.5)]' : 'border-[#3c2a1a] border-dashed text-transparent'}`}
             >
               {selectedSlots[i] ? selectedSlots[i].char : ''}
             </div>
           ))}
         </div>

         {/* Source letters */}
         <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center max-w-2xl relative z-10">
            {scrambledArray.map((item, index) => (
              <motion.button
                key={index}
                whileHover={!item.used ? { scale: 1.1 } : {}}
                whileTap={!item.used ? { scale: 0.9 } : {}}
                onClick={() => handleSelect(index)}
                disabled={item.used || isLoading}
                className={`w-10 h-12 md:w-14 md:h-16 flex items-center justify-center text-lg md:text-2xl font-bold font-serif rounded shadow-md border border-[#c49b66]/50 transition-all ${item.used ? 'opacity-20 bg-black/50 cursor-not-allowed scale-90' : 'bg-[#2a1d12] text-[#e4d5b7] hover:bg-[#3c2a1a] hover:border-[#c49b66] cursor-pointer'}`}
              >
                {item.char}
              </motion.button>
            ))}
         </div>

         <div className="mt-6 flex gap-4 relative z-10">
           <button 
             onClick={() => {
               setScrambledArray(scrambledArray.map(s => ({ ...s, used: false })));
               setSelectedSlots([]);
             }}
             className="px-4 py-2 md:px-6 md:py-3 border border-[#c49b66] text-[#c49b66] uppercase tracking-[0.2em] text-[10px] md:text-xs font-bold hover:bg-[#c49b66]/10 hover:shadow-[0_0_15px_rgba(196,155,102,0.5)] flex items-center gap-2"
           >
             <RotateCcw className="w-3 h-3 md:w-4 md:h-4" /> RESET
           </button>
           <button 
             onClick={handleSubmit}
             disabled={selectedSlots.length !== wordToScramble.length || isLoading}
             className="px-6 py-2 md:px-10 md:py-3 bg-[#c49b66] text-[#120c08] uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold hover:bg-[#e4d5b7] hover:shadow-[0_0_20px_rgba(196,155,102,0.8)] disabled:opacity-50 disabled:hover:bg-[#c49b66] transition-all flex items-center gap-2"
           >
             UNLOCK <Unlock className="w-3 h-3 md:w-4 md:h-4" />
           </button>
         </div>
      </div>
    );
  }

  // Session 3: Multiple Choice Doors
  if (session === 3) {
    const options = puzzle.options || ["A", "B", "C"];
    const [openingDoor, setOpeningDoor] = useState<string | null>(null);

    const handleDoorClick = (opt: string) => {
      if (isLoading || openingDoor) return;
      setOpeningDoor(opt);
      setTimeout(() => {
        onSolve(opt);
        setTimeout(() => setOpeningDoor(null), 1000); // Reset after 1s
      }, 800); // 800ms animation
    };

    return (
      <div className="flex flex-col items-center mt-2">
        <h3 className="text-[#e4d5b7] text-[11px] md:text-sm font-serif  mb-3 text-center max-w-xl">Behind the correct door waits a piece of history.</h3>
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
           {options.map((opt, i) => {
             const isOpening = openingDoor === opt;
             return (
               <motion.div
                 key={i}
                 whileHover={!isOpening && !isLoading ? { scale: 1.05, y: -5 } : {}}
                 whileTap={!isOpening && !isLoading ? { scale: 0.95 } : {}}
                 onClick={() => handleDoorClick(opt)}
                 animate={isOpening ? {
                   rotateY: 105,
                   opacity: 0,
                   transition: { duration: 0.8, ease: "easeIn" }
                 } : { rotateY: 0, opacity: 1 }}
                 style={{ transformOrigin: "left center", perspective: 1000 }}
                 className={`relative cursor-pointer w-24 h-32 md:w-32 md:h-44 bg-gradient-to-b from-[#3c2a1a] to-[#120c08] border-2 border-[#5c402a] rounded-t-full shadow-2xl flex flex-col items-center justify-center overflow-hidden group ${(isLoading || openingDoor) ? 'pointer-events-none' : ''}`}
               >
                  <div className="absolute inset-0 bg-[#c49b66]/0 group-hover:bg-[#c49b66]/10 transition-colors" />
                  <motion.div animate={isOpening ? { scale: 1.5, opacity: 0 } : {}}>
                    {isOpening ? <Unlock className="w-5 h-5 md:w-6 md:h-6 text-[#c49b66] mb-2 md:mb-4" /> : <Lock className="w-5 h-5 md:w-6 md:h-6 text-[#c49b66]/50 mb-2 md:mb-4 group-hover:text-[#c49b66] transition-colors" />}
                  </motion.div>
                  <span className="text-[#e4d5b7] font-serif font-medium text-xs md:text-sm text-center px-2 group-hover:text-white leading-tight">{opt}</span>
                  {/* Door detail */}
                  <div className="absolute bottom-0 w-full h-1 bg-[#120c08] shadow-[0_-5px_15px_rgba(0,0,0,0.5)]" />
               </motion.div>
             );
           })}
        </div>
      </div>
    );
  }

  // Session 4: Logic / Pinboard Clues
  if (session === 4) {
    return (
      <div className="relative p-6 bg-[#f4e2c6] mt-4 mb-2 rounded-sm shadow-xl max-w-2xl mx-auto shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-[#d6bca5] w-full min-h-[350px] md:min-h-[250px] flex items-center justify-center overflow-y-auto md:overflow-hidden group">
         <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')]" />
         
         {/* Envelope Flap styling */}
         <div className="absolute top-0 left-0 w-full h-[60%] bg-[#ecd7b6] origin-top border-b border-[#cca780] z-20 pointer-events-none shadow-sm" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
         
         {/* Top Secret Stamp */}
         <div className="absolute top-4 right-4 md:top-6 md:right-8 w-12 h-16 md:w-16 md:h-20 border-2 border-[#bf8b67] bg-[#dfc9b3] flex items-center justify-center p-1 z-30 opacity-80 rotate-6">
            <div className="border border-[#bf8b67] w-full h-full opacity-50 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-red-800/80 text-red-800/80 font-black text-[5px] md:text-[6px] tracking-widest uppercase -rotate-12 flex items-center justify-center text-center leading-none">TOP<br/>SECRET</div>
            </div>
         </div>
         
         <div className="font-mono text-[#2a1d12] flex flex-col md:flex-row items-center relative z-10 w-full md:pl-10 h-full py-8 md:py-0">
            <div className="bg-yellow-100/90 p-3 shadow-md border border-yellow-200 w-full max-w-sm mb-6 md:mb-0 md:mr-4 mt-8 md:mt-12">
               <h2 className="text-xs md:text-sm font-black mb-1 uppercase tracking-[0.2em] border-b-2 border-[#2a1d12]/20 pb-1 text-red-900">Classified File</h2>
               <div className="font-bold text-[10px] md:text-xs leading-snug text-[#3c2a1a] drop-shadow-sm flex flex-col gap-1">
                  {(puzzle.question.split(']: ')[1] || puzzle.question).split('. ').map((sentence, idx) => (
                    <span key={idx} className="block">{sentence}{sentence.endsWith('?') ? '' : '.'}</span>
                  ))}
               </div>
            </div>
            
            <div className="w-full max-w-[200px] flex flex-col z-30 md:mt-12">
              <div className="bg-gray-200 w-full h-12 md:h-16 mb-2 flex items-center justify-center border-4 border-gray-100 shadow-inner overflow-hidden relative">
                 <div className="absolute inset-0 bg-[#000] opacity-5"></div>
                 <Search className="w-6 h-6 md:w-8 md:h-8 text-gray-400 opacity-50" />
              </div>
              <input 
                type="text" 
                value={inputLocal}
                onChange={(e) => setInputLocal(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && onSolve(inputLocal)}
                disabled={isLoading}
                placeholder="IDENTIFIED SUBJECT..."
                className="w-full bg-transparent border-b border-gray-500 text-center text-xs md:text-sm font-black text-gray-800 focus:outline-none focus:border-red-600 py-1 placeholder-gray-400 font-mono  px-2 mb-2 uppercase"
              />
              
              <button 
                onClick={() => onSolve(inputLocal)}
                disabled={!inputLocal.trim() || isLoading}
                className="w-full px-4 py-2 bg-[#111] text-[#fff] font-bold uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-red-800 hover:shadow-[0_0_15px_rgba(153,27,27,0.8)] transition-colors disabled:opacity-50 shadow-lg border-2 border-white/10"
              >
                Verify Match
              </button>
            </div>
         </div>
      </div>
    );
  }

  // Session 5: Vault Keypad
  if (session === 5) {
      return (
       <div className="flex justify-center mt-2">
         <div className="bg-[#1a1a1a] p-3 md:p-4 rounded-xl border-4 border-[#333] shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center max-w-[300px] w-full">
            <h3 className="text-gray-500 font-mono text-[10px] md:text-xs uppercase mb-3 tracking-[0.2em] relative w-full text-center">
              CHRONO-VAULT
              <div className="absolute top-[50%] left-0 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red] -translate-y-1/2" />
            </h3>
            
            {/* LCD Screen */}
            <div className="w-full h-12 md:h-14 bg-[#001400] border-2 border-[#003300] rounded mb-4 flex flex-col items-center justify-center p-2 relative overflow-hidden">
               <div className="absolute inset-0 bg-[#00ff00] opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)' }}></div>
               <span className="text-[#00ff00] font-mono text-xl md:text-2xl tracking-[0.2em] animate-pulse">
                {inputLocal || "_"}
               </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-7 gap-1 md:gap-1.5 w-full mb-4">
              {('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')).map(char => (
                <button
                  key={char}
                  onClick={() => setInputLocal(prev => prev.length < 20 ? prev + char : prev)}
                  disabled={isLoading}
                  className="bg-[#222] border-b-[3px] border-[#111] text-gray-400 font-mono py-1.5 rounded text-[10px] md:text-xs hover:bg-[#333] hover:text-white active:border-b-0 active:translate-y-[2px] transition-all"
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full">
               <button 
                 onClick={() => setInputLocal(prev => prev.slice(0, -1))}
                 className="flex-1 bg-red-900 border-b-[3px] border-red-950 text-red-200 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-800 hover:shadow-[0_0_15px_rgba(153,27,27,0.8)] active:border-b-0 active:translate-y-[2px] transition-all"
               >
                 CLEAR
               </button>
               <button 
                 onClick={() => onSolve(inputLocal)}
                 disabled={!inputLocal || isLoading}
                 className="flex-[2] bg-green-900 border-b-[3px] border-green-950 text-green-200 py-1.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-green-800 hover:shadow-[0_0_15px_rgba(22,101,52,0.8)] active:border-b-0 active:translate-y-[2px] transition-all disabled:opacity-50"
               >
                 ENTER
               </button>
            </div>
         </div>
       </div>
     );
  }

  // Fallback / Session 1 text input handled in App.tsx directly
  return null;
}
