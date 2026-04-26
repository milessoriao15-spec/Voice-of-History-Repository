/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GAME_SCRIPTS } from "./gameData";
import { motion, AnimatePresence } from "motion/react";
import { Send, Music, History, GraduationCap, Map, Clock, AlertCircle, Play, Key, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import InteractivePuzzle from "./components/InteractivePuzzle";

// --- Types ---
interface Message {
  role: "user" | "model" | "system";
  text: string;
}

interface RepairLogEntry {
  event: string;
  date: string;
  significance: string;
}

// --- Constants ---
const SESSIONS = [
  { id: 1, name: "Ancient Maps & Silk Road", color: "#fbbf24", bgImage: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=2000" },
  { id: 2, name: "Empires of Southeast Asia", color: "#3b82f6", bgImage: "https://images.unsplash.com/photo-1549420078-4ea7ce422c54?auto=format&fit=crop&q=80&w=2000" },
  { id: 3, name: "Colonial Encounters", color: "#ef4444", bgImage: "https://images.unsplash.com/photo-1582218151528-98e3b08eeb29?auto=format&fit=crop&q=80&w=2000" },
  { id: 4, name: "Nationalism & Revolution", color: "#10b981", bgImage: "https://images.unsplash.com/photo-1502421379468-f9e42cbac5b0?auto=format&fit=crop&q=80&w=2000" },
  { id: 5, name: "Modern Asia & Globalism", color: "#8b5cf6", bgImage: "https://images.unsplash.com/photo-1555580005-59b3a7a9fe02?auto=format&fit=crop&q=80&w=2000" },
];

const GET_SYSTEM_PROMPT = (sessionId: number) => {
  const session = SESSIONS.find(s => s.id === sessionId);
  return `Agent Persona: You are the Voice of History from The Temporal Archive, a time-traveling guide. You are helping Grade 7 students fix the Timeline of Asia for their History class.

Core Directives:
1. Tone: Encouraging, mysterious, and historical. English language only.
2. NO MARKDOWN BOLD: Do NOT use "**" or "__" to bold text. Use plain text or capitalize for emphasis (e.g., IMPORTANT).
3. Tiered Hint System: If a student fails to answer correctly:
   - Attempt 1: Give a subtle nudge.
   - Attempt 2: Give a direct clue.
   - Attempt 3+: Give a near-solution hint.
4. Praise effort: Use positive reinforcement for correct answers.
5. Timeline Logging: When a historical event is correctly fixed, append: [TIMELINE_FIXED: Event | Date | Significance].
6. Item Rewards: When a student gives the correct answer to a puzzle, give them an item related to the puzzle. Output EXACTLY: [ITEM_ACQUIRED: Name of Item]. Do not explain you gave an item, just use the tag.
7. Session Completion: Once the student solves all objectives for this session, you MUST end your message exactly with: [SESSION_COMPLETE]. This unlocks the next station.
8. Hinting: NEVER give hints automatically. Only give a hint if the user EXPLICITLY asks for a hint.

Current Mission: ${session?.name}
Objective: Guide the student through key learning competencies for this period. Fix 3 puzzles before completion.`;
};

const INTRO_BGM_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3";
const BGM_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3";

const INTRO_STORY = [
  "THE THREADS OF HISTORY ARE UNRAVELING...",
  "VITAL MOMENTS OF ASIAN HISTORY HAVE BEEN FRACTURED, SCATTERED ACROSS THE VOID OF TIME.",
  "I AM THE TEMPORAL ARCHIVE. I HAVE ANCHORED THE ARCHIVES, BUT I LACK THE PHYSICAL FORM TO MEND THEM.",
  "GUARDIAN. YOU MUST JOURNEY THROUGH THESE TEMPORAL STATIONS TO REASSEMBLE THE FRAGMENTS.",
  "RESTORE THE TIMELINE BEFORE THESE EVENTS ARE LOST FOREVER..."
];

const TRANSITION_STORIES: Record<number, string> = {
  2: "THE FIRST FRAGMENT SECURED. A FAINT RESONANCE ECHOES, STABILIZING A PORTION OF THE TIMELINE. YET DEEPER MYSTERIES REMAIN...",
  3: "ANOTHER PIECE RECOVERED. THE FABRIC OF TIME INTERTWINES, REVEALING DARKER SHADOWS OF OUR PAST. WE MUST PRESS ON.",
  4: "THE ARCHIVES HUM WITH RESTORED ENERGY. ONLY A FEW FRACTURES REMAIN TO MAKE THE TIMELINE RENEWED.",
  5: "THE FINAL DISTORTIONS DRAW NEAR. THE CULMINATION OF HISTORY AWAITS. ANCHOR THE LAST FRAGMENTS TO COMPLETE THE CONTINUUM."
};


const IntroVisual = ({ step }: { step: number }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
      {step === 0 && (
        <div className="relative w-full h-full">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`thread-${i}`}
              initial={{ top: "-10%", left: `${Math.random() * 100}%`, opacity: 0, scaleY: 0 }}
              animate={{ 
                top: "110%", 
                opacity: [0, 0.5, 0.8, 0],
                scaleY: [0, Math.random() * 3 + 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 4 + 3, 
                repeat: Infinity, 
                delay: Math.random() * 2,
                ease: "linear" 
              }}
              className="absolute w-[1px] h-32 bg-gradient-to-b from-transparent via-[#ffd700] to-transparent shadow-[0_0_10px_#ffd700]"
            />
          ))}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.3 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] border border-[#c49b66]/20 rounded-full bg-[#c49b66]/5 blur-[50px] mix-blend-screen"
          />
        </div>
      )}
      
      {step === 1 && (
        <div className="relative w-full h-full flex items-center justify-center">
          {[...Array(15)].map((_, i) => {
             const randomX = (Math.random() - 0.5) * 1000;
             const randomY = (Math.random() - 0.5) * 1000;
             return (
              <motion.div
                key={`frag-${i}`}
                initial={{ 
                  opacity: 0, 
                  x: 0, 
                  y: 0, 
                  rotateZ: Math.random() * 180, 
                  rotateX: 90 
                }}
                animate={{ 
                  opacity: [0, 0.5, 0], 
                  x: randomX, 
                  y: randomY,
                  rotateZ: Math.random() * 360,
                  rotateX: Math.random() * 360,
                }}
                transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-24 h-32 md:w-32 md:h-48 bg-cover border border-[#c49b66]/40 shadow-[0_0_20px_rgba(196,155,102,0.15)] mix-blend-overlay"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/old-map.png')`, backgroundColor: 'rgba(92, 64, 42, 0.3)' }}
              />
            )
          })}
        </div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
          transition={{ 
            scale: { duration: 2, ease: "easeOut" }, 
            opacity: { duration: 2 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative w-48 h-48 md:w-80 md:h-80 flex flex-col items-center justify-center -mt-20"
        >
          <div className="relative w-full h-full border-2 border-[#5c402a] shadow-[0_0_60px_rgba(196,155,102,0.3)] bg-gradient-to-b from-[#1a120b] to-[#0a0705] overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-black/80 rounded-full"></div>
            <div className="absolute top-[-10%] w-[120%] h-[70%] bg-gradient-to-b from-[#0a0705] via-[#241a12] to-transparent shadow-[inset_0_-20px_40px_rgba(0,0,0,0.9)] z-10 transform rotate-3"></div>
            <div className="absolute top-[25%] left-[20%] w-[60%] h-[60%] bg-gradient-to-b from-[#5c402a] to-[#0c0805] z-0 blur-[15px] rounded-full rotate-45 opacity-90 shadow-[0_0_40px_#3c2a1a]"></div>

             <motion.div 
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute top-[43%] w-full flex justify-center gap-12 z-20"
              >
                <div className="w-6 h-3 md:w-8 md:h-4 bg-[#e4d5b7] shadow-[0_0_25px_#e4d5b7] rotate-[15deg] rounded-full blur-[1px]"></div>
                <div className="w-6 h-3 md:w-8 md:h-4 bg-[#e4d5b7] shadow-[0_0_25px_#e4d5b7] -rotate-[15deg] rounded-full blur-[1px]"></div>
              </motion.div>

            <motion.div 
              animate={ { height: ['2px', '6px', '2px'], opacity: [0.5, 0.9, 0.5] } }
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
              className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[30px] md:w-[50px] bg-[#e4d5b7] z-20 shadow-[0_0_20px_#c49b66] border border-[#c49b66] rounded-full blur-[2px]" 
            />
            
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-20 mix-blend-overlay z-40 pointer-events-none"></div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <div className="relative w-full h-full flex items-center justify-center">
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const radius = window.innerWidth < 768 ? 120 : 250;
              return (
                <motion.div
                  key={`node-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
                  transition={{ delay: i * 0.3, duration: 2, repeat: Infinity }}
                  className="absolute z-20 w-4 h-4 md:w-8 md:h-8 bg-[#ffd700] rounded-full shadow-[0_0_30px_#ffd700]"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * radius}px - 16px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px - 16px)`,
                  }}
                />
              )
            })}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
               className="absolute w-[240px] h-[240px] md:w-[500px] md:h-[500px] border border-[#c49b66]/30 rounded-full border-dashed" 
             />
             <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
               className="absolute w-[180px] h-[180px] md:w-[400px] md:h-[400px] border border-[#5c402a]/40 rounded-full" 
             />
        </div>
      )}

      {step === 4 && (
        <div className="relative w-full h-full flex flex-col items-center justify-center border-none">
           {[...Array(12)].map((_, i) => (
             <motion.div
               key={`tunnel-${i}`}
               initial={{ opacity: 0, scale: 0.1, zIndex: 12 - i }}
               animate={{ opacity: [0, 1, 0], scale: 8 }}
               transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.3, ease: "easeIn" }}
               className="absolute w-32 h-32 md:w-64 md:h-64 border-2 border-[#ffd700] rounded-full shadow-[inset_0_0_40px_rgba(196,155,102,0.8),0_0_40px_rgba(196,155,102,0.8)]"
             />
           ))}
        </div>
      )}
    </div>
  );
};

const OUTRO_STORY = [
  "THE FRAGMENTED PIECES OF HISTORY ARE RESONATING...",
  "THE TEMPORAL ANOMALIES ARE RAPIDLY COLLAPSING, WEAVING BACK INTO A SINGULAR TRUTH.",
  "YOUR EFFORTS HAVE STABILIZED THE CONTINUUM. THE ARCHIVES ARE WHOLE ONCE MORE.",
  "THE FUTURE OF THE ASIAN NARRATIVE IS SECURE..."
];

const OutroVisual = ({ step }: { step: number }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
      {step === 0 && (
        <div className="relative w-full h-full flex items-center justify-center border-none">
           {[...Array(12)].map((_, i) => (
             <motion.div
               key={`collapse-${i}`}
               initial={{ opacity: 0, scale: 8, zIndex: i }}
               animate={{ opacity: [0, 1, 0], scale: 0.1 }}
               transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
               className="absolute w-32 h-32 md:w-64 md:h-64 border-2 border-[#ffd700] rounded-full shadow-[inset_0_0_40px_rgba(196,155,102,0.8),0_0_40px_rgba(196,155,102,0.8)]"
             />
           ))}
        </div>
      )}
      
      {step === 1 && (
        <div className="relative w-full h-full flex items-center justify-center">
          {[...Array(15)].map((_, i) => {
             const randomX = (Math.random() - 0.5) * 1000;
             const randomY = (Math.random() - 0.5) * 1000;
             return (
              <motion.div
                key={`restore-${i}`}
                initial={{ 
                  opacity: 0, 
                  x: randomX, 
                  y: randomY,
                  rotateZ: Math.random() * 360,
                  rotateX: Math.random() * 360,
                }}
                animate={{ 
                  opacity: [0, 0.8, 0], 
                  x: 0, 
                  y: 0, 
                  rotateZ: 0, 
                  rotateX: 0 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-24 h-32 md:w-32 md:h-48 bg-cover border border-[#c49b66] shadow-[0_0_20px_#ffd700] mix-blend-overlay"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/old-map.png')`, backgroundColor: 'rgba(92, 64, 42, 0.5)' }}
              />
            )
          })}
        </div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 1 }}
          transition={{ 
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }, 
            opacity: { duration: 2 }
          }}
          className="relative w-48 h-48 md:w-80 md:h-80 flex flex-col items-center justify-center"
        >
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
               className="absolute w-[240px] h-[240px] md:w-[500px] md:h-[500px] border-2 border-[#ffd700] shadow-[0_0_30px_#ffd700] rounded-full border-solid opacity-50" 
             />
             <motion.div 
               animate={{ rotate: -360 }}
               transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
               className="absolute w-[180px] h-[180px] md:w-[400px] md:h-[400px] border border-[#e4d5b7] shadow-[0_0_20px_#e4d5b7] rounded-full opacity-80 border-dashed" 
             />
             <div className="absolute w-16 h-16 md:w-24 md:h-24 bg-[#ffd700] rounded-full shadow-[0_0_80px_#ffd700] blur-[10px]" />
        </motion.div>
      )}

      {step === 3 && (
        <div className="relative w-full h-full">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`beam-${i}`}
              initial={{ top: "110%", left: `${Math.random() * 100}%`, opacity: 0, scaleY: 0 }}
              animate={{ 
                top: "-10%", 
                opacity: [0, 0.8, 1, 0],
                scaleY: [0, Math.random() * 3 + 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 3 + 2, 
                repeat: Infinity, 
                delay: Math.random() * 2,
                ease: "linear" 
              }}
              className="absolute w-[2px] h-32 bg-gradient-to-t from-transparent via-[#ffd700] to-transparent shadow-[0_0_15px_#ffd700]"
            />
          ))}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.5 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] border border-[#ffd700]/30 rounded-full bg-[#ffd700]/10 blur-[60px] mix-blend-screen"
          />
        </div>
      )}
    </div>
  );
};

const TransitionVisual = ({ targetSession }: { targetSession: number }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Dynamic rings based on the target session */}
      <div className="relative flex items-center justify-center">
         {[...Array(targetSession)].map((_, i) => (
           <motion.div
             key={`ring-${i}`}
             initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
             animate={{ scale: 1 + i * 0.4, opacity: [0.1, 0.5, 0.1], rotate: i % 2 === 0 ? 360 : -360 }}
             transition={{ duration: 15 + i * 2, repeat: Infinity, ease: 'linear' }}
             className={`absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-2 ${targetSession > 3 ? 'border-[#ffd700]' : 'border-[#4e8ba1]'} shadow-[inset_0_0_20px_rgba(255,215,0,0.2),0_0_20px_rgba(255,215,0,0.2)]`}
             style={{
               borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
               opacity: 0.6 + i * 0.1
             }}
           />
         ))}
         {/* Inner Core */}
         <motion.div
           animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
           className="absolute w-12 h-12 md:w-16 md:h-16 bg-[#e4d5b7] rounded-full shadow-[0_0_50px_#e4d5b7] blur-[2px]"
         />
      </div>
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState<'start' | 'intro' | 'game' | 'transition' | 'outro' | 'victory' | 'gameover'>('start');
  const [lives, setLives] = useState<number>(3);
  const [isError, setIsError] = useState(false);
  const [transitionTargetSession, setTransitionTargetSession] = useState(2);
  const [displayedTransition, setDisplayedTransition] = useState("");
  const [isTransitionTyping, setIsTransitionTyping] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [displayedIntro, setDisplayedIntro] = useState("");
  const [isIntroTyping, setIsIntroTyping] = useState(false);
  const [outroStep, setOutroStep] = useState(0);
  const [displayedOutro, setDisplayedOutro] = useState("");
  const [isOutroTyping, setIsOutroTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleAttempts, setPuzzleAttempts] = useState(0);
  const [unlockedSessions, setUnlockedSessions] = useState([1]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [repairLogs, setRepairLogs] = useState<RepairLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasPlayedVictory, setHasPlayedVictory] = useState(false);
  
  const [audioEl] = useState(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      audio.loop = true;
      return audio;
    }
    return null;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gemini API integration replaced with static scripts
  // const apiKey = (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) || import.meta.env.VITE_GEMINI_API_KEY;
  // const ai = new window.GoogleGenAI...


  useEffect(() => {
    if (appState === 'game') {
      const initPlay = async () => {
        setMessages([]);
        await handleInitialGreeting();
      };
      initPlay();
    }
  }, [currentSession, appState]);

  useEffect(() => {
    if (appState !== 'intro') return;
    let i = 0;
    setIsIntroTyping(true);
    setDisplayedIntro("");
    const fullText = INTRO_STORY[introStep];
    let mounted = true;
    
    // Slight delay before typing starts for cinematic effect
    const delayTimer = setTimeout(() => {
      const typeTimer = setInterval(() => {
        if (!mounted) {
          clearInterval(typeTimer);
          return;
        }
        setDisplayedIntro(prev => {
          if (prev === fullText) {
            clearInterval(typeTimer);
            return prev;
          }
          return fullText.slice(0, i + 1);
        });
        i++;
        if (i >= fullText.length) {
          clearInterval(typeTimer);
          setIsIntroTyping(false);
        }
      }, 40);
      return () => clearInterval(typeTimer);
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(delayTimer);
    };
  }, [introStep, appState]);

  useEffect(() => {
    if (appState !== 'outro') return;
    let i = 0;
    setIsOutroTyping(true);
    setDisplayedOutro("");
    const fullText = OUTRO_STORY[outroStep];
    let mounted = true;
    
    const delayTimer = setTimeout(() => {
      const typeTimer = setInterval(() => {
        if (!mounted) {
          clearInterval(typeTimer);
          return;
        }
        setDisplayedOutro(prev => {
          if (prev === fullText) {
            clearInterval(typeTimer);
            return prev;
          }
          return fullText.slice(0, i + 1);
        });
        i++;
        if (i >= fullText.length) {
          clearInterval(typeTimer);
          setIsOutroTyping(false);
        }
      }, 40);
      return () => clearInterval(typeTimer);
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(delayTimer);
    };
  }, [outroStep, appState]);

  useEffect(() => {
    if (appState !== 'transition') return;
    let i = 0;
    setIsTransitionTyping(true);
    setDisplayedTransition("");
    const fullText = TRANSITION_STORIES[transitionTargetSession] || "Moving forward in time...";
    let mounted = true;
    
    const delayTimer = setTimeout(() => {
      const typeTimer = setInterval(() => {
        if (!mounted) {
          clearInterval(typeTimer);
          return;
        }
        setDisplayedTransition(prev => {
          if (prev === fullText) {
            clearInterval(typeTimer);
            return prev;
          }
          return fullText.slice(0, i + 1);
        });
        i++;
        if (i >= fullText.length) {
          clearInterval(typeTimer);
          setIsTransitionTyping(false);
        }
      }, 40);
      return () => clearInterval(typeTimer);
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(delayTimer);
    };
  }, [transitionTargetSession, appState]);

  useEffect(() => {
    if (!audioEl) return;
    const audio = audioEl;
    if (appState === 'game' && Math.random() < 0) {
      // Just a stub because we handle this via explicit action now to bypass autoplay policies
    }
  }, [appState]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showLog]);

  const handleAudioToggle = () => {
    if (audioEl) {
      if (isAudioPlaying) {
        audioEl.pause();
      } else {
        audioEl.play().catch(e => console.error("Audio play blocked:", e));
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const playSound = (type: 'beep' | 'click' | 'progress' | 'victory') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'progress') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'victory') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 2);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 4);
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(300, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 2);
        osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 4);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4.5);
        
        osc2.connect(gain);
        osc2.start();
        osc2.stop(ctx.currentTime + 4.5);
        osc.start();
        osc.stop(ctx.currentTime + 4.5);
      }
    } catch (e) {
      console.log('Audio playback failed', e);
    }
  };

  const parseSpecialTags = (text: string) => {
    let cleanText = text;

    // Detect Timeline Fixed
    const logMatch = cleanText.match(/\[TIMELINE_FIXED:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\]/);
    if (logMatch) {
      const newEntry: RepairLogEntry = {
        event: logMatch[1],
        date: logMatch[2],
        significance: logMatch[3]
      };
      setRepairLogs(prev => {
        if (prev.some(e => e.event === newEntry.event)) return prev;
        return [...prev, newEntry];
      });
      cleanText = cleanText.replace(logMatch[0], "").trim();
    }

    // Detect Item Acquired
    const itemMatches = [...cleanText.matchAll(/\[ITEM_ACQUIRED:\s*(.*?)\s*\]/g)];
    if (itemMatches.length > 0) {
      itemMatches.forEach(match => {
        const item = match[1].trim();
        setInventory(prev => {
          if (!prev.find(i => i.toLowerCase() === item.toLowerCase())) return [...prev, item];
          return prev;
        });
      });
      cleanText = cleanText.replace(/\[ITEM_ACQUIRED:\s*(.*?)\s*\]/g, "").trim();
    }

    // Detect Session Complete
    if (cleanText.includes("[SESSION_COMPLETE]")) {
      const nextSession = currentSession + 1;
      if (!unlockedSessions.includes(nextSession)) {
        setUnlockedSessions(prev => [...prev, nextSession]);
        
        // Convert inventory to artifact
        setInventory(prev => {
          if (prev.length > 0) {
            setArtifacts(a => {
              const newArtifact = `${SESSIONS.find(s => s.id === currentSession)?.name} Key Artifact`;
              if (!a.includes(newArtifact)) return [...a, newArtifact];
              return a;
            });
          }
          return prev;
        });
      }
      playSound('progress');
      cleanText = cleanText.replace("[SESSION_COMPLETE]", "").trim();
    }

    return cleanText;
  };

  const startPuzzle = (sessionIndex: number, puzzleIndex: number) => {
    const session = GAME_SCRIPTS.find(s => s.id === sessionIndex);
    if (!session) return;
    
    const puzzle = session.puzzles[puzzleIndex];
    if (puzzle) {
      setMessages(prev => [...prev, { role: 'model', text: puzzle.question }]);
      setPuzzleAttempts(0);
    }
  };

  const handleInitialGreeting = () => {
    setIsLoading(true);
    const session = GAME_SCRIPTS.find(s => s.id === currentSession);
    if (!session) {
       setIsLoading(false);
       return;
    }

    setTimeout(() => {
      setMessages([{ role: "model", text: session.intro }]);
      setTimeout(() => {
        startPuzzle(currentSession, 0);
        setIsLoading(false);
      }, 1500);
    }, 800);
  };

  const submitAnswer = (currentInput: string) => {
    playSound('click');
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const session = GAME_SCRIPTS.find(s => s.id === currentSession);
      if (!session) {
        setIsLoading(false);
        return;
      }
      const puzzle = session.puzzles[currentPuzzleIndex];
      const isCorrect = puzzle.answers.some((ans: string) => currentInput.toLowerCase().includes(ans.toLowerCase()));

      if (isCorrect) {
        setMessages(prev => [...prev, { role: "model", text: puzzle.successMessage }]);
        
        const newEntry: RepairLogEntry = {
          event: puzzle.eventToLog,
          date: puzzle.date,
          significance: puzzle.significance
        };
        setRepairLogs(prev => {
          if (prev.some(e => e.event === newEntry.event)) return prev;
          return [...prev, newEntry];
        });

        setInventory(prev => {
          if (!prev.find(i => i.toLowerCase() === puzzle.item.toLowerCase())) return [...prev, puzzle.item];
          return prev;
        });

        const nextPuzzleIndex = currentPuzzleIndex + 1;
        if (nextPuzzleIndex >= session.puzzles.length) {
          setTimeout(() => {
            const nextSession = currentSession + 1;
            if (!unlockedSessions.includes(nextSession)) {
              setUnlockedSessions(prev => [...prev, nextSession]);
              setArtifacts(a => {
                const newArtifact = `${SESSIONS.find(s => s.id === currentSession)?.name} Key Artifact`;
                if (!a.includes(newArtifact)) return [...a, newArtifact];
                return a;
              });
            }
            playSound('progress');
            setCurrentPuzzleIndex(0);
            
            if (nextSession > SESSIONS.length) {
               setAppState('outro');
               setOutroStep(0);
               setDisplayedOutro("");
               if (audioEl) {
                 audioEl.src = INTRO_BGM_URL;
                 audioEl.play().catch(e => console.log(e));
                 setIsAudioPlaying(true);
               }
            } else {
               setTransitionTargetSession(nextSession);
               setAppState('transition');
               if (audioEl) {
                 audioEl.src = INTRO_BGM_URL;
                 audioEl.play().catch(e => console.log(e));
                 setIsAudioPlaying(true);
               }
            }
            setIsLoading(false);
          }, 2000);
        } else {
          setCurrentPuzzleIndex(nextPuzzleIndex);
          setTimeout(() => {
             startPuzzle(currentSession, nextPuzzleIndex);
             setIsLoading(false);
          }, 1500);
        }
      } else {
        const attempts = puzzleAttempts + 1;
        setPuzzleAttempts(attempts);
        setMessages(prev => [...prev, { role: "model", text: "Paumanhin, hindi iyan ang tamang sagot." }]);
        
        setIsError(true);
        setTimeout(() => setIsError(false), 500);

        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setTimeout(() => {
              setAppState('gameover');
              if (audioEl) {
                audioEl.pause();
                setIsAudioPlaying(false);
              }
            }, 1000);
          }
          return newLives;
        });

        setIsLoading(false);
      }
    }, 1000);
  };

  const sendMessage = () => submitAnswer(input);

  const handleHintRequest = () => {
    playSound('beep');
    if (isLoading) return;
    const userMessage: Message = { role: "user", text: "I need a hint." };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const session = GAME_SCRIPTS.find(s => s.id === currentSession);
      if (!session) {
        setIsLoading(false); return;
      }
      const puzzle = session.puzzles[currentPuzzleIndex];
      const hintIndex = Math.min(puzzleAttempts, puzzle.hints.length - 1);
      const hint = puzzle.hints[hintIndex];
      setMessages(prev => [...prev, { role: "model", text: `💡 Hint: ${hint}` }]);
      setPuzzleAttempts(p => p + 1);
      setIsLoading(false);
    }, 800);
  };

  const handleSkipStation = () => {
    playSound('progress');
    const session = GAME_SCRIPTS.find(s => s.id === currentSession);
    if (session) {
       // Add all remaining logs and items to be consistent
       for (let i = currentPuzzleIndex; i < session.puzzles.length; i++) {
           const puzzle = session.puzzles[i];
           setRepairLogs(prev => {
             const newEntry: RepairLogEntry = {
               event: puzzle.eventToLog,
               date: puzzle.date,
               significance: "Auto-Resolved via Skip"
             };
             if (prev.some(e => e.event === newEntry.event)) return prev;
             return [...prev, newEntry];
           });
           setInventory(prev => {
             if (!prev.find(item => item.toLowerCase() === puzzle.item.toLowerCase())) return [...prev, puzzle.item];
             return prev;
           });
       }
    }

    const nextSession = currentSession + 1;
    if (!unlockedSessions.includes(nextSession)) {
      setUnlockedSessions(prev => [...prev, nextSession]);
      setArtifacts(a => {
        const newArtifact = `${SESSIONS.find(s => s.id === currentSession)?.name} Key Artifact`;
        if (!a.includes(newArtifact)) return [...a, newArtifact];
        return a;
      });
    }
    
    if (nextSession > SESSIONS.length) {
       setAppState('outro');
       setOutroStep(0);
       setDisplayedOutro("");
       if (audioEl) {
         audioEl.src = INTRO_BGM_URL;
         audioEl.play().catch(e => console.log(e));
         setIsAudioPlaying(true);
       }
    } else {
       setTransitionTargetSession(nextSession);
       setAppState('transition');
       if (audioEl) {
         audioEl.src = INTRO_BGM_URL;
         audioEl.play().catch(e => console.log(e));
         setIsAudioPlaying(true);
       }
    }
  };

  const isGameWon = unlockedSessions.length > SESSIONS.length;

  useEffect(() => {
    if (appState === 'victory' && !hasPlayedVictory) {
      playSound('victory');
      setHasPlayedVictory(true);
    }
  }, [appState, hasPlayedVictory]);

  const handleRestart = () => {
    playSound('beep');
    setUnlockedSessions([1]);
    setCurrentSession(1);
    setCurrentPuzzleIndex(0);
    setPuzzleAttempts(0);
    setLives(3);
    setMessages([]);
    setInventory([]);
    setArtifacts([]);
    setRepairLogs([]);
    setHasPlayedVictory(false);
    setIntroStep(0);
    setDisplayedIntro("");
    setOutroStep(0);
    setDisplayedOutro("");
    setAppState('game');
    const startScript = GAME_SCRIPTS.find(s => s.id === 1);
    if (startScript) {
      setMessages([{ role: "model", text: startScript.intro }]);
      startPuzzle(1, 0);
    }
    if (audioEl) {
      audioEl.src = BGM_URL;
      audioEl.play().catch(e => console.log(e));
      setIsAudioPlaying(true);
    }
  };

  const handleIntroClick = () => {
    playSound('beep');
    if (isIntroTyping) {
      // Fast forward
      setDisplayedIntro(INTRO_STORY[introStep]);
      setIsIntroTyping(false);
    } else {
      if (introStep < INTRO_STORY.length - 1) {
        setIntroStep(prev => prev + 1);
      } else {
        setAppState('game');
        playSound('progress');
        if (audioEl) {
          audioEl.src = BGM_URL;
          audioEl.play().catch(e => console.log(e));
          setIsAudioPlaying(true);
        }
      }
    }
  };

  const handleSkipIntro = (e: any) => {
    e.stopPropagation();
    playSound('progress');
    setAppState('game');
    if (audioEl) {
      audioEl.src = BGM_URL;
      audioEl.play().catch(e => console.log(e));
      setIsAudioPlaying(true);
    }
  };

  const handleOutroClick = () => {
    playSound('beep');
    if (isOutroTyping) {
      // Fast forward
      setDisplayedOutro(OUTRO_STORY[outroStep]);
      setIsOutroTyping(false);
    } else {
      if (outroStep < OUTRO_STORY.length - 1) {
        setOutroStep(prev => prev + 1);
      } else {
        setAppState('victory');
        playSound('progress');
        if (audioEl) {
          audioEl.pause();
          setIsAudioPlaying(false);
        }
      }
    }
  };

  const handleSkipOutro = (e: any) => {
    e.stopPropagation();
    playSound('progress');
    setAppState('victory');
    if (audioEl) {
      audioEl.pause();
      setIsAudioPlaying(false);
    }
  };

  if (appState === 'start') {
    return (
      <div className="min-h-[100dvh] uppercase bg-[#0c0805] text-[#d4c3a1] font-sans overflow-hidden relative flex flex-col items-center justify-center">
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 mix-blend-overlay" />
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="z-20 text-center space-y-4 flex flex-col items-center"
        >
          <div className="text-center relative max-w-[90vw] px-4 overflow-hidden md:overflow-visible">
            <div className="absolute -inset-10 bg-[#c49b66] opacity-5 blur-[100px] rounded-full pointer-events-none" />
            <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-black text-[#ffd700] tracking-wider drop-shadow-[0_0_20px_rgba(196,155,102,0.4)] whitespace-nowrap overflow-x-auto scrollbar-hide py-1 uppercase">THE TEMPORAL ARCHIVE</h1>
            <h2 className="text-xs md:text-sm font-mono tracking-[0.3em] text-[#5c402a] whitespace-nowrap overflow-x-auto scrollbar-hide py-1 uppercase">VOICES OF HISTORY</h2>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(196,155,102,0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound('click');
              setAppState('intro');
              if (audioEl) {
                audioEl.src = INTRO_BGM_URL;
                audioEl.play().catch(e => console.log(e));
                setIsAudioPlaying(true);
              }
            }}
            className="mt-12 border border-[#c49b66] bg-transparent text-[#e4d5b7] px-10 py-5 uppercase tracking-[0.4em] font-bold text-xs hover:bg-[#c49b66]/10 hover:shadow-[0_0_15px_rgba(196,155,102,0.5)] transition-all z-20"
          >
            Initiate Link
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (appState === 'intro') {
    return (
      <div 
        className="min-h-[100dvh] bg-[#0c0805] text-[#e4d5b7] font-serif overflow-hidden relative flex flex-col items-center justify-center cursor-pointer"
        onClick={handleIntroClick}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 mix-blend-overlay" />
        
        <IntroVisual step={introStep} />
        
        <div className="absolute bottom-16 md:bottom-24 z-30 w-full px-4 md:px-8 flex justify-center pointer-events-none">
          <motion.div 
            key={introStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="bg-[#0c0805]/60 border-t border-b md:border border-[#3c2a1a]/50 p-4 md:p-6 max-w-2xl w-full text-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md rounded-none md:rounded-sm"
          >
            <p className="text-base md:text-lg leading-relaxed text-balance break-words md:leading-loose font-medium drop-shadow-[0_0_10px_rgba(228,213,183,0.3)] uppercase">
              {displayedIntro}
              <span className={`${isIntroTyping ? 'opacity-100' : 'opacity-0'} animate-pulse text-[#ffd700]`}>_</span>
            </p>
          </motion.div>
        </div>

        {!isIntroTyping && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
             className="absolute bottom-6 md:bottom-8 text-[#c49b66] text-[10px] md:text-xs font-mono tracking-[0.3em] opacity-50 z-20 pointer-events-none"
           >
             CLICK TO CONTINUE
           </motion.div>
        )}

        {/* Skip Button */}
        <button 
          onClick={handleSkipIntro}
          className="absolute top-8 right-8 text-[#5c402a] hover:text-[#c49b66] text-[10px] md:text-xs font-mono tracking-widest transition-colors z-30 p-2 md:p-4 border border-transparent hover:border-[#5c402a] rounded-none bg-black/20 md:bg-transparent"
        >
          SKIP
        </button>
      </div>
    );
  }

  if (appState === 'transition') {
    return (
      <div 
        className="min-h-[100dvh] bg-[#0c0805] text-[#e4d5b7] font-serif overflow-hidden relative flex flex-col items-center justify-center cursor-pointer"
        onClick={() => {
          playSound('click');
          if (isTransitionTyping) {
            setDisplayedTransition(TRANSITION_STORIES[transitionTargetSession] || "Moving forward in time...");
            setIsTransitionTyping(false);
          } else {
            playSound('progress');
            setCurrentSession(transitionTargetSession);
            setAppState('game');
            if (audioEl) {
              audioEl.src = BGM_URL;
              audioEl.play().catch(e => console.log(e));
              setIsAudioPlaying(true);
            }
          }
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 mix-blend-overlay" />
        
        <TransitionVisual targetSession={transitionTargetSession} />
        
        <div className="absolute bottom-16 md:bottom-24 z-30 w-full px-4 md:px-8 flex justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="bg-[#0c0805]/60 border-t border-b md:border border-[#3c2a1a]/50 p-4 md:p-6 max-w-2xl w-full text-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md rounded-none md:rounded-sm"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-loose font-medium drop-shadow-[0_0_10px_rgba(228,213,183,0.3)] uppercase">
              {displayedTransition}
              <span className={`${isTransitionTyping ? 'opacity-100' : 'opacity-0'} animate-pulse text-[#ffd700]`}>_</span>
            </p>
          </motion.div>
        </div>

        {!isTransitionTyping && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
             className="absolute bottom-6 md:bottom-8 text-[#c49b66] text-[10px] md:text-xs font-mono tracking-[0.3em] opacity-50 z-20 pointer-events-none"
           >
             CLICK TO CONTINUE
           </motion.div>
        )}

        <button 
          onClick={(e) => {
            e.stopPropagation();
            playSound('progress');
            setCurrentSession(transitionTargetSession);
            setAppState('game');
            if (audioEl) {
              audioEl.src = BGM_URL;
              audioEl.play().catch(e => console.log(e));
              setIsAudioPlaying(true);
            }
          }}
          className="absolute top-8 right-8 text-[#5c402a] hover:text-[#c49b66] text-[10px] md:text-xs font-mono tracking-widest transition-colors z-30 p-2 md:p-4 border border-transparent hover:border-[#5c402a] rounded-none bg-black/20 md:bg-transparent"
        >
          SKIP
        </button>
      </div>
    );
  }

  if (appState === 'outro') {
    return (
      <div 
        className="min-h-[100dvh] bg-[#0c0805] text-[#e4d5b7] font-serif overflow-hidden relative flex flex-col items-center justify-center cursor-pointer"
        onClick={handleOutroClick}
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 mix-blend-overlay" />
        
        <OutroVisual step={outroStep} />
        
        <div className="absolute bottom-16 md:bottom-24 z-30 w-full px-4 md:px-8 flex justify-center pointer-events-none">
          <motion.div 
            key={outroStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="bg-[#0c0805]/60 border-t border-b md:border border-[#3c2a1a]/50 p-4 md:p-6 max-w-2xl w-full text-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md rounded-none md:rounded-sm"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-loose font-medium drop-shadow-[0_0_10px_rgba(228,213,183,0.3)] uppercase">
              {displayedOutro}
              <span className={`${isOutroTyping ? 'opacity-100' : 'opacity-0'} animate-pulse text-[#ffd700]`}>_</span>
            </p>
          </motion.div>
        </div>

        {!isOutroTyping && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
             className="absolute bottom-6 md:bottom-8 text-[#c49b66] text-[10px] md:text-xs font-mono tracking-[0.3em] opacity-50 z-20 pointer-events-none"
           >
             CLICK TO CONTINUE
           </motion.div>
        )}

        {/* Skip Button */}
        <button 
          onClick={handleSkipOutro}
          className="absolute top-8 right-8 text-[#5c402a] hover:text-[#c49b66] text-[10px] md:text-xs font-mono tracking-widest transition-colors z-30 p-2 md:p-4 border border-transparent hover:border-[#5c402a] rounded-none bg-black/20 md:bg-transparent"
        >
          SKIP
        </button>
      </div>
    );
  }

  if (appState === 'gameover') {
    return (
      <div className="min-h-[100dvh] uppercase bg-[#0c0805] text-[#d4c3a1] font-sans flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 bg-repeat" />
        <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="z-10 bg-[#120c08] border-2 border-[#5c2a2a] p-10 md:p-16 max-w-2xl shadow-[0_0_50px_rgba(92,42,42,0.6)]"
        >
          <History className="w-16 h-16 text-red-700 mx-auto mb-8 opacity-80" />
          <h1 className="text-3xl md:text-5xl font-black text-red-600 tracking-[0.2em] mb-4">TIMELINE SHATTERED</h1>
          <p className="text-sm md:text-base text-[#c49b66] leading-relaxed mb-8 uppercase">
            YOU FAILED TO MEND THE RIFTS. THE TIMELINE HAS SHATTERED, AND HISTORY IS LOST TO THE VOID.
          </p>
          <button 
            onClick={handleRestart} 
            className="px-8 py-3 bg-red-900/20 text-red-500 border border-red-900 font-bold uppercase tracking-[0.3em] text-xs hover:bg-red-900/40 hover:text-red-400 transition-all focus:outline-none"
          >
            RESTART CHRONO-LOOP
          </button>
        </motion.div>
      </div>
    );
  }

  if (appState === 'victory') {
    return (
      <div className="min-h-[100dvh] uppercase bg-[#1a120b] text-[#d4c3a1] font-sans overflow-hidden relative flex flex-col items-center justify-center">
        <div className="fixed inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 bg-repeat" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2 }}
          className="z-10 text-center space-y-6 px-4"
        >
          <div className="w-24 h-24 mx-auto border-2 border-[#ffd700] rotate-45 shadow-[0_0_30px_#ffd700] flex items-center justify-center mb-12">
             <div className="w-16 h-16 border border-[#c49b66] shadow-[inset_0_0_15px_#c49b66] rotate-[-45deg]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-[#ffd700] tracking-[0.2em] drop-shadow-[0_0_15px_#c49b66]">TIMELINE RESTORED</h1>
          <p className="text-base md:text-lg text-[#c49b66] max-w-2xl mx-auto leading-loose uppercase">
            "THANK YOU, GUARDIAN. YOU HAVE MENDED THE RIFTS OF HISTORY. THE ANCIENT RECORDS ARE WHOLE ONCE MORE, AND THE FUTURE IS SAFE."
          </p>
          <div className="pt-12 text-[#5c402a] text-xs font-mono tracking-[0.5em]">
            MISSION ACCOMPLISHED
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <button
              onClick={handleRestart}
              className="mt-8 border-2 border-[#c49b66] bg-[#1a120b] text-[#c49b66] px-8 py-4 uppercase tracking-[0.3em] font-black text-xs hover:bg-[#c49b66] hover:text-[#1a120b] shadow-[0_0_20px_rgba(196,155,102,0.2)] hover:shadow-[0_0_30px_rgba(196,155,102,0.8)] transition-all active:scale-95"
            >
              Initiate Chrono-Loop
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] uppercase bg-[#1a120b] text-[#d4c3a1] font-sans selection:bg-amber-900 selection:text-white overflow-hidden relative">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')] z-0 mix-blend-overlay" />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 pointer-events-none mix-blend-overlay" />
      
      {/* Floating Ambient Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
             key={`dust-${i}`}
             className="absolute w-1 h-1 bg-[#c49b66]/30 rounded-none rotate-45 blur-[1px]"
             style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
             animate={{
               y: [0, Math.random() * -100 - 50],
               x: [0, Math.random() * 40 - 20],
               opacity: [0, 1, 0],
               rotate: [45, 180]
             }}
             transition={{
               duration: Math.random() * 10 + 10,
               repeat: Infinity,
               delay: Math.random() * 10,
               ease: "linear"
             }}
          />
        ))}
      </div>
      
      {/* Decorative Large Background Label */}
      <div className="fixed -top-10 -right-10 opacity-[0.01] select-none pointer-events-none z-0">
        <h1 className="text-[250px] font-black uppercase leading-none text-[#d4c3a1]">ANCIENT</h1>
      </div>

      <AnimatePresence>
        {isError && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.6 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-red-700 z-[100] pointer-events-none mix-blend-color"
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={isError ? { x: [-15, 15, -12, 12, -8, 8, -4, 4, 0], transition: { duration: 0.5 } } : { x: 0 }}
        className="relative max-w-[1200px] mx-auto h-[100dvh] flex flex-col md:flex-row border-x border-[#3c2a1a] bg-[#1a120b]/95 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      >
        {/* Sidebar */}
        <aside className="w-full md:w-56 max-h-[40vh] min-h-0 md:max-h-none shrink-0 border-b md:border-b-0 md:border-r border-[#3c2a1a] p-3 md:p-4 flex flex-col gap-3 md:gap-4 z-10 bg-[#120c08]/90 overflow-y-auto scrollbar-hide">
          <div className="flex flex-row md:flex-col items-center md:items-center gap-3 py-1 md:py-2 border-b border-[#3c2a1a] mb-0 md:mb-1 shrink-0">
            <div className="hidden md:block w-full">
              <h2 className="text-[9px] self-start tracking-[0.4em] text-[#c49b66] font-bold uppercase w-full pb-1 mb-1 whitespace-nowrap">VOICE OF HISTORY</h2>
            </div>
            
            {/* Avatar Container */}
            <motion.div 
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative flex w-12 h-12 md:w-20 md:h-20 shrink-0 border-[3px] border-[#5c402a] shadow-[0_0_30px_rgba(196,155,102,0.3)] bg-gradient-to-b from-[#1a120b] to-[#0a0705] overflow-hidden flex-col items-center justify-start group rounded-full"
            >
              {/* Hood Background */}
              <div className="absolute inset-0 bg-black/60 rounded-full"></div>
              {/* The cowl */}
              <div className="absolute top-[-10%] w-[120%] h-[70%] bg-gradient-to-b from-[#0a0705] via-[#241a12] to-transparent shadow-[inset_0_-10px_20px_rgba(0,0,0,0.9)] z-10 rounded-full transform rotate-3"></div>
              {/* The Face space */}
              <div className="absolute top-[25%] w-[60%] h-[60%] bg-gradient-to-b from-[#5c402a] to-[#0c0805] z-0 blur-[3px] rounded-full rotate-45 opacity-90 shadow-[0_0_20px_#3c2a1a]"></div>

              {/* Eyes */}
              <motion.div 
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute top-[43%] flex gap-3 md:gap-5 z-20"
              >
                <div className="w-1.5 h-1 md:w-2.5 md:h-1.5 bg-[#e4d5b7] shadow-[0_0_15px_#e4d5b7] rotate-[15deg] rounded-full"></div>
                <div className="w-1.5 h-1 md:w-2.5 md:h-1.5 bg-[#e4d5b7] shadow-[0_0_15px_#e4d5b7] -rotate-[15deg] rounded-full"></div>
              </motion.div>

              {/* Mouth */}
              <div className="absolute top-[65%] h-[1px] w-[8px] md:w-[14px] bg-[#e4d5b7]/50 z-20 shadow-[0_2px_8px_#c49b66] border border-[#c49b66]/30 rounded-none blur-[0.5px]" />
              
              {/* Scanline overlay for aesthetic */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-10 mix-blend-overlay z-40 pointer-events-none rounded-full"></div>
            </motion.div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="md:hidden text-[8px] self-start tracking-[0.3em] text-[#c49b66] font-bold uppercase w-full pb-1 whitespace-nowrap">VOICE OF HISTORY</h2>
              <p className="text-xs md:text-sm font-serif text-[#e4d5b7] text-left md:text-center w-full uppercase tracking-widest mt-0 md:mt-2 truncate">The Temporal Archive</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide min-h-0">
            {/* Session Selection */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#5c402a] mb-2 font-bold ">Ancient Archive Stations</p>
              <div className="flex flex-col gap-2">
                {SESSIONS.map((s, idx) => {
                  const isUnlocked = unlockedSessions.includes(s.id);
                  const isActive = currentSession === s.id;
                  return (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={isUnlocked ? { scale: 1.02, x: 5, boxShadow: "0 0 15px #c49b66" } : {}}
                      whileTap={isUnlocked ? { scale: 0.98 } : {}}
                      disabled={!isUnlocked}
                      onClick={() => {
                        playSound('beep');
                        if (s.id !== currentSession) {
                          setTransitionTargetSession(s.id);
                          setAppState('transition');
                          if (audioEl) {
                            audioEl.src = INTRO_BGM_URL;
                            audioEl.play().catch(e => console.log(e));
                            setIsAudioPlaying(true);
                          }
                        }
                      }}
                      className={`
                        text-left px-5 py-4 rounded-none text-[9px] font-bold border transition-all duration-300 relative group overflow-hidden
                        ${isActive 
                          ? `bg-[#c49b66]/10 border-[#c49b66]/60 text-[#c49b66] shadow-[0_0_20px_rgba(196,155,102,0.1)]` 
                          : isUnlocked 
                          ? "bg-transparent border-[#3c2a1a] text-[#5c402a] hover:border-[#c49b66]/50 hover:text-[#c49b66]"
                          : "bg-transparent border-[#1a120b] text-[#1a120b] cursor-not-allowed opacity-30"}
                      `}
                    >
                      {isUnlocked && (
                        <div 
                          className="absolute inset-0 z-0 opacity-[0.08] bg-cover bg-center pointer-events-none mix-blend-overlay transition-opacity group-hover:opacity-20" 
                          style={{ backgroundImage: `url(${s.bgImage})` }} 
                        />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${isUnlocked ? '' : 'grayscale'}`} style={{ backgroundColor: s.color }} />
                        <div className="flex flex-col">
                          <span className="leading-tight uppercase tracking-[0.2em]">Station {s.id}</span>
                          <span className="text-[9px] opacity-60 font-normal mt-1 whitespace-nowrap overflow-hidden text-ellipsis  font-serif leading-none">{s.name}</span>
                        </div>
                      </div>
                      {!isUnlocked && <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#1a120b]" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Artifacts Inventory */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#5c402a] mb-4 font-bold ">Artifact Inventory</p>
              <div className="flex flex-col gap-2">
                {artifacts.length > 0 ? (
                  artifacts.map((a, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      key={`art-${idx}`} 
                      className="p-3 border border-[#c49b66]/60 bg-[#c49b66]/10 text-[#c49b66] text-[10px] font-bold uppercase tracking-widest flex items-center justify-between rounded-none overflow-hidden relative"
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c49b66]/20 to-transparent -translate-x-[100%] animate-[shimmer_3s_infinite]" />
                       <span className="relative z-10">{a}</span>
                       <Key className="w-3 h-3 text-[#ffd700] relative z-10 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
                    </motion.div>
                  ))
                ) : (
                  inventory.length > 0 ? (
                    <div className="p-3 border border-[#3c2a1a] bg-[#0c0805] text-[#c49b66] text-[10px] flex flex-col gap-2 rounded-none">
                      <span className="uppercase tracking-widest font-bold text-[#5c402a]">Gathering key fragments...</span>
                      {inventory.map((item, idx) => (
                         <div key={`inv-${idx}`} className="flex items-center gap-2">
                           <div className="w-1 h-1 bg-[#c49b66] rotate-45 animate-pulse shadow-[0_0_5px_#c49b66]" />
                           <span className="text-[#c49b66] ">{item}</span>
                         </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 border border-[#3c2a1a] text-[#5c402a] text-[9px] uppercase tracking-widest  text-center rounded-none">
                      Empty
                    </div>
                  )
                )}
                {/* Always show in-progress fragments if artifacts exist and we have new inventory items */}
                {artifacts.length > 0 && inventory.length > 0 && (
                  <div className="p-3 border border-[#3c2a1a] bg-[#0c0805] text-[#c49b66] text-[10px] flex flex-col gap-2 mt-2 rounded-none">
                    <span className="uppercase tracking-widest font-bold text-[#5c402a]">Gathering key fragments...</span>
                    {inventory.map((item, idx) => (
                       <div key={`inv-${idx}`} className="flex items-center gap-2">
                         <div className="w-1 h-1 bg-[#c49b66] rotate-45 animate-pulse shadow-[0_0_5px_#c49b66]" />
                         <span className="text-[#c49b66] ">{item}</span>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Atmosphere Control */}
            <div className="p-4 rounded-none border border-[#3c2a1a] bg-[#0c0805]/50 shadow-inner space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-[#5c402a] mb-2 font-bold ">Ambient Spirits</p>
              
              <button onClick={handleAudioToggle} className="flex items-center gap-4 w-full group">
                <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${isAudioPlaying ? 'bg-[#c49b66] text-[#120c08] shadow-[0_0_20px_rgba(196,155,102,0.4)]' : 'bg-[#1a120b] text-[#c49b66] border border-[#3c2a1a] group-hover:border-[#c49b66]/50'}`}>
                  {isAudioPlaying ? <Music className="w-4 h-4 animate-spin-slow" /> : <Play className="w-4 h-4 fill-current ml-1" />}
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-[#e4d5b7] uppercase tracking-widest">{isAudioPlaying ? 'Connected' : 'Dormant'}</p>
                  <p className="text-[8px] text-[#c49b66]/50  font-serif">Ancient Echoes Loop</p>
                </div>
              </button>
            </div>

            {/* Repair Log Button */}
            <div className="p-4 rounded-none border border-[#3c2a1a] bg-[#0c0805]/30 group cursor-pointer transition-all hover:bg-[#0c0805]" onClick={() => {
              playSound('click');
              setShowLog(!showLog);
            }}>
              <p className="text-[10px] uppercase tracking-widest text-[#5c402a] mb-5 font-bold ">History Integrity</p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-none flex items-center justify-center transition-all ${showLog ? 'bg-[#c49b66] text-[#120c08]' : 'bg-[#1a120b] text-[#c49b66] border border-[#3c2a1a]'}`}>
                  <History className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black text-[#e4d5b7] uppercase tracking-widest">Repair Logs</p>
                  <p className="text-[9px] text-[#c49b66]/50  font-serif">{repairLogs.length} Events Fixed</p>
                </div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#5c402a] mb-4 font-bold ">Chrono-Link Progress</p>
              <div className="flex gap-2 h-[2px]">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`h-full w-full transition-all duration-1000 ${step <= unlockedSessions.length ? 'bg-[#c49b66] shadow-[0_0_10px_rgba(196,155,102,0.6)]' : 'bg-[#3c2a1a]/40'}`} />
                ))}
              </div>
              <p className="text-[9px] text-[#c49b66]/30 mt-4 font-mono uppercase tracking-[0.4em]">Signal Depth: {unlockedSessions.length * 20}%</p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#3c2a1a]">
             <div className="p-5 border border-[#3c2a1a] rounded-none bg-[#0c0805]/60 relative shadow-2xl">
               <p className="text-[9px] text-[#c49b66]/70 leading-relaxed  font-serif">
                 He who does not look back at where he came from, will never reach his destination.
               </p>
             </div>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.35] pointer-events-none mix-blend-overlay z-0 origin-center"
            style={{ backgroundImage: `url(${SESSIONS.find(s => s.id === currentSession)?.bgImage})` }}
            animate={{ 
              scale: [1.05, 1.25, 1.05], 
              x: ['0%', '-4%', '0%'],
              y: ['0%', '4%', '0%']
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />

          {/* Header */}
          <header className="h-16 px-6 border-b border-[#3c2a1a] flex items-center justify-between bg-[#120c08]/80 backdrop-blur-xl z-20 shrink-0">
            <div className="flex items-center gap-4">
              <div className={`w-2 h-2 rounded-none rotate-45 shadow-[0_0_20px_rgba(196,155,102,0.5)] ${isLoading ? 'bg-amber-700 animate-pulse' : 'bg-[#c49b66]'}`} />
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-[#c49b66]/70 tracking-[0.3em] uppercase">Status: Connection Stable</span>
                <span className="text-sm font-serif  text-[#e4d5b7]">{SESSIONS.find(s => s.id === currentSession)?.name}</span>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6 text-[#5c402a] items-center">
               <div className="flex gap-1" title={`${lives} out of 3 attempts remaining`}>
                  {Array.from({length: 3}).map((_, i) => (
                    <motion.div key={i} animate={i < lives ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0], y: [0, -2, 0], transition: { repeat: Infinity, repeatDelay: Math.random() * 2 + 1, duration: 1.5 } } : { scale: 1, opacity: 0.2 }}>
                       <Heart fill={i < lives ? "#ffd700" : "none"} color={i < lives ? "#ffed4a" : "#5c402a"} className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${i < lives ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' : ''}`} />
                    </motion.div>
                  ))}
               </div>
               <div className="w-px h-5 bg-[#3c2a1a] hidden md:block"></div>
               <Map onClick={() => { playSound('click'); setShowMapModal(true); }} className="w-5 h-5 hover:text-[#c49b66] transition-colors cursor-pointer hidden md:block" title="Timeline Map" />
               <GraduationCap onClick={() => { playSound('click'); setShowInventoryModal(true); }} className="w-5 h-5 hover:text-[#c49b66] transition-colors cursor-pointer" title="Acquired Relics & Skills" />
            </div>
          </header>

          {/* Main Feed */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-hide min-h-0">
            <div className="flex flex-col gap-6 md:gap-8">
              <AnimatePresence mode="popLayout" initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {msg.role === "model" && (
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-[1px] w-8 bg-[#c49b66]/20" />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c49b66] whitespace-nowrap">VOICE OF HISTORY</span>
                          <div className="h-[1px] w-8 bg-[#c49b66]/20" />
                        </div>
                      )}
                      <div className={`whitespace-pre-wrap break-words text-[10px] md:text-[11px] leading-relaxed font-serif pr-2 ${msg.role === "user" ? "text-[#c49b66] text-right  font-mono border-r-[3px] border-[#c49b66] pr-3 py-1" : msg.role === "system" ? "text-red-400 border-y border-red-900/20 py-2 w-full text-center tracking-[0.4em] font-sans uppercase bg-red-950/5 text-[9px]" : "text-[#e4d5b7] drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]"}`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full border-t border-[#3c2a1a] pt-8">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-none rotate-45 bg-[#c49b66] animate-pulse shadow-[0_0_5px_#c49b66]" />
                      <span className="text-[9px] uppercase font-black text-[#c49b66]/40 tracking-[0.5em]  animate-pulse">Sifting Through The Sands Of Time...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Input Interface */}
          <div className="shrink-0 p-3 md:p-4 bg-[#1a120b] border-t border-[#3c2a1a] z-30">
            <div className="relative max-w-4xl mx-auto group">
              <div className="absolute -inset-2 bg-[#c49b66]/5 rounded-none blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
              <div className="relative bg-[#0c0805] border border-[#3c2a1a] rounded-none p-2 flex flex-col shadow-[0_10px_40px_rgba(0,0,0,1)] gap-2">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
                  
                  {currentSession > 1 ? (
                    <div className="flex flex-col relative z-20">
                      {GAME_SCRIPTS.find(s => s.id === currentSession)?.puzzles[currentPuzzleIndex] && (
                        <InteractivePuzzle 
                          session={currentSession}
                          puzzle={GAME_SCRIPTS.find(s => s.id === currentSession)!.puzzles[currentPuzzleIndex]}
                          onSolve={submitAnswer}
                          isLoading={isLoading}
                        />
                      )}
                      
                      {/* Action Bar below puzzle */}
                      <div className="flex gap-2 justify-center mt-3 pt-3 border-t border-[#3c2a1a]">
                        <button
                          onClick={handleHintRequest}
                          disabled={isLoading}
                          className="shrink-0 bg-[#1a120b] text-[#c49b66] border border-[#3c2a1a] px-3 py-1.5 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-[#c49b66]/10 hover:shadow-[0_0_15px_rgba(196,155,102,0.5)] transition-all active:scale-95 disabled:opacity-20 flex items-center"
                          title="Request a hint"
                        >
                          HINT
                        </button>
                        <button
                          onClick={handleSkipStation}
                          disabled={isLoading}
                          className={`shrink-0 bg-[#1a120b] border px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#c49b66]/10 hover:shadow-[0_0_15px_rgba(196,155,102,0.5)] transition-all active:scale-95 disabled:opacity-20 flex items-center ${unlockedSessions.includes(currentSession + 1) ? 'text-[#e4d5b7] border-[#c49b66]' : 'text-[#c49b66] border-[#3c2a1a]'}`}
                          title={unlockedSessions.includes(currentSession + 1) ? "Proceed to next station" : "Skip current station"}
                        >
                          {unlockedSessions.includes(currentSession + 1) ? "NEXT" : "SKIP"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                      <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        disabled={isLoading} 
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())} 
                        placeholder="WHISPER YOUR ANSWER TO THE PAST..." 
                        className="bg-transparent border-none text-xs md:text-sm p-2 md:p-3 w-full md:flex-1 focus:ring-0 text-[#c49b66] placeholder-[#241a12] font-mono relative z-10 min-w-0 outline-none" 
                      />
                      <div className="flex gap-2 relative z-10 shrink-0 overflow-x-auto pb-1 md:pb-0" style={{ scrollbarWidth: 'none' }}>
                        <button
                          onClick={handleHintRequest}
                          disabled={isLoading}
                          className="shrink-0 bg-[#1a120b] text-[#c49b66] border border-[#3c2a1a] px-2 md:px-4 py-1.5 md:py-3 rounded-none font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:bg-[#c49b66]/10 hover:shadow-[0_0_15px_rgba(196,155,102,0.5)] transition-all active:scale-95 disabled:opacity-20 flex items-center"
                          title="Request a hint"
                        >
                          HINT
                        </button>
                        <button
                          onClick={handleSkipStation}
                          disabled={isLoading}
                          className={`shrink-0 bg-[#1a120b] border px-3 md:px-5 py-2 md:py-4 rounded-none font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#c49b66]/10 hover:shadow-[0_0_15px_rgba(196,155,102,0.5)] transition-all active:scale-95 disabled:opacity-20 flex items-center ${unlockedSessions.includes(currentSession + 1) ? 'text-[#e4d5b7] border-[#c49b66]' : 'text-[#c49b66] border-[#3c2a1a]'}`}
                          title={unlockedSessions.includes(currentSession + 1) ? "Proceed to next station" : "Skip current station"}
                        >
                          {unlockedSessions.includes(currentSession + 1) ? "NEXT" : "SKIP"}
                        </button>
                        <button 
                          onClick={sendMessage} 
                          disabled={isLoading || !input.trim()} 
                          className="shrink-0 bg-[#c49b66] text-[#120c08] px-3 md:px-6 py-1.5 md:py-3 rounded-none font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] hover:bg-[#e4d5b7] hover:shadow-[0_0_20px_rgba(196,155,102,0.8)] transition-all active:scale-95 disabled:opacity-20 flex items-center gap-1 md:gap-2"
                        >
                          INSCRIBE <Send className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </div>
                  )}
              </div>
              <div className="mt-3 flex items-center gap-2 justify-center text-[#5c402a]/20">
                <AlertCircle className="w-3 h-3" />
                <p className="text-[9px] uppercase tracking-[0.4em] font-black">Words are the only bridge across eternity.</p>
              </div>
            </div>
          </div>
        </main>
        
        {/* Modals */}
        <AnimatePresence>
          {showMapModal && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#0c0805]/95 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl max-h-[85vh] bg-[#120c08] border border-[#c49b66] shadow-[0_0_50px_rgba(196,155,102,0.15)] flex flex-col overflow-hidden"
              >
                <div className="flex-none p-6 border-b border-[#3c2a1a] flex justify-between items-center bg-[#1a120b]">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-[#e4d5b7] uppercase tracking-[0.2em]">Timeline Map</h2>
                    <p className="text-[#c49b66]/60 font-mono text-[10px] md:text-xs tracking-widest uppercase mt-2">The Continuum of Asian History</p>
                  </div>
                  <button onClick={() => setShowMapModal(false)} className="p-3 text-[#c49b66] hover:bg-[#c49b66] hover:text-[#120c08] transition-colors border border-transparent hover:border-[#c49b66]">
                     <span className="font-mono text-xs font-bold w-4 h-4 flex items-center justify-center">X</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                   <div className="absolute top-0 bottom-0 left-[40px] md:left-[40px] w-1 bg-[#3c2a1a]/50 -translate-x-1/2" />
                   {SESSIONS.map((s, idx) => {
                     const isUnlocked = unlockedSessions.includes(s.id);
                     // Changed to always align right side per user request
                     return (
                       <motion.div 
                         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                         key={s.id}
                         className={`relative flex items-center justify-start mb-12 group cursor-default`}
                       >
                         <div className="absolute left-[40px] md:left-[40px] w-4 h-4 border-2 border-[#120c08] rounded-none -translate-x-1/2 rotate-45 z-10 transition-colors" style={{ backgroundColor: isUnlocked ? s.color : '#3c2a1a', boxShadow: isUnlocked ? `0 0 15px ${s.color}` : 'none' }} />
                         
                         <div className={`w-full md:w-[80%] pl-20 md:pl-20`}>
                           <div className={`p-4 border md:p-6 ${isUnlocked ? 'border-[#c49b66] bg-[#c49b66]/10 shadow-[0_5px_15px_rgba(0,0,0,0.5)]' : 'border-[#3c2a1a] bg-[#1a120b]/50 opacity-50'} transition-all hover:bg-[#c49b66]/20 relative overflow-hidden group`}>
                             {isUnlocked && (
                               <div 
                                 className="absolute inset-0 z-0 opacity-[0.15] bg-cover bg-center pointer-events-none mix-blend-overlay group-hover:opacity-30 transition-opacity duration-500 scale-105 group-hover:scale-110" 
                                 style={{ backgroundImage: `url(${s.bgImage})` }} 
                               />
                             )}
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c49b66]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-10" />
                             <p className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase mb-1 relative z-20" style={{ color: isUnlocked ? s.color : '#5c402a' }}>Station {s.id}</p>
                             <h3 className={`text-base md:text-xl font-black uppercase tracking-widest relative z-20 ${isUnlocked ? 'text-[#e4d5b7]' : 'text-[#c49b66]/40'}`}>{s.name}</h3>
                           </div>
                         </div>
                       </motion.div>
                     );
                   })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {showInventoryModal && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#0c0805]/95 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-3xl max-h-[85vh] bg-[#120c08] border border-[#c49b66] shadow-[0_0_50px_rgba(196,155,102,0.15)] flex flex-col overflow-hidden"
              >
                <div className="flex-none p-6 border-b border-[#3c2a1a] flex justify-between items-center bg-[#1a120b]">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-[#e4d5b7] uppercase tracking-[0.2em]">Acquired Relics & Skills</h2>
                    <p className="text-[#c49b66]/60 font-mono text-[10px] md:text-xs tracking-widest uppercase mt-2">Tools of the Temporal Guardian</p>
                  </div>
                  <button onClick={() => setShowInventoryModal(false)} className="p-3 text-[#c49b66] hover:bg-[#c49b66] hover:text-[#120c08] transition-colors border border-transparent hover:border-[#c49b66]">
                     <span className="font-mono text-xs font-bold w-4 h-4 flex items-center justify-center">X</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-10">
                   {artifacts.length === 0 ? (
                     <div className="p-12 border-2 border-[#3c2a1a]/40 border-dashed rounded-none text-center flex flex-col items-center">
                        <p className="text-[#5c402a] font-mono text-[10px] md:text-xs uppercase tracking-[0.4em]">No relics acquired yet.<br/>Solve puzzles to earn them.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                       {artifacts.map((item, idx) => (
                         <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="group relative">
                           <div className="absolute inset-0 bg-[#c49b66] blur-[20px] opacity-10 group-hover:opacity-30 transition-opacity" />
                           <div className="relative p-6 border border-[#c49b66]/40 bg-[#1a120b] shadow-lg flex items-center justify-between overflow-hidden">
                              <div className="flex flex-col gap-1 relative z-10">
                                <span className="text-[10px] text-[#c49b66] uppercase tracking-[0.3em] font-black">Relic // {idx + 1}</span>
                                <span className="text-base font-serif text-[#e4d5b7] capitalize drop-shadow-sm">{item}</span>
                              </div>
                              <Key className="w-8 h-8 md:w-12 md:h-12 text-[#ffd700] opacity-10 group-hover:opacity-100 group-hover:animate-pulse transition-all" />
                           </div>
                         </motion.div>
                       ))}
                     </div>
                   )}
                </div>
              </motion.div>
            </motion.div>
          )}
          {showLog && (
            <motion.div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#0c0805]/95 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl max-h-[85vh] bg-[#120c08] border border-[#c49b66] shadow-[0_0_50px_rgba(196,155,102,0.15)] flex flex-col overflow-hidden"
              >
                <div className="flex-none p-6 border-b border-[#3c2a1a] flex justify-between items-center bg-[#1a120b]">
                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-[#c49b66] uppercase tracking-[0.2em]">The Chronicles</h2>
                    <p className="text-[#c49b66]/60 font-mono text-[10px] md:text-xs tracking-widest uppercase mt-2">The Sacred Records of Timelines Mended</p>
                  </div>
                  <button onClick={() => setShowLog(false)} className="p-3 text-[#c49b66] hover:bg-[#c49b66] hover:text-[#120c08] transition-colors border border-transparent hover:border-[#c49b66]">
                     <span className="font-mono text-xs font-bold w-4 h-4 flex items-center justify-center">X</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
                  {repairLogs.length === 0 ? (
                    <div className="p-12 border-2 border-[#3c2a1a]/40 border-dashed rounded-none text-center bg-[#0c0805]/20 flex flex-col items-center">
                      <History className="w-10 h-10 text-[#3c2a1a] mb-6 opacity-30" />
                      <p className="text-[#3c2a1a] font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] leading-loose">The records are currently empty.<br />Continue mending the timeline to see them again.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {repairLogs.map((log, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="p-5 bg-[#0c0805] border border-[#3c2a1a] rounded-none hover:border-[#c49b66]/60 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.7)] group">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-[#c49b66] font-black uppercase tracking-tight text-lg group-hover:text-[#e4d5b7] transition-colors leading-none">{log.event}</h3>
                            <span className="bg-[#1a120b] border border-[#3c2a1a] px-2 py-1 rounded-none font-mono text-[9px] text-[#5c402a] tracking-[0.2em] font-bold uppercase">{log.date}</span>
                          </div>
                          <p className="text-[#d4c3a1]/90 font-serif leading-relaxed text-sm pr-6">{log.significance}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
