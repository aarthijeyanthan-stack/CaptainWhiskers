import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Briefcase, 
  ChevronRight, 
  CheckCircle, 
  User, 
  Star, 
  Lock, 
  ExternalLink, 
  X, 
  Ship, 
  Trophy, 
  Skull, 
  HelpCircle, 
  Gem 
} from 'lucide-react';

// --- Expanded 10-Chapter Curriculum Data ---
const generatePath = (lang, title, careerTiers) => {
  const baseChapters = [
    { id: '1', title: "The Shore (Basics)" },
    { id: '2', title: "Deep Blue (Logic)" },
    { id: '3', title: "The Reef (Structures)" },
    { id: '4', title: "Whale Song (Functions)" },
    { id: '5', title: "Sunken Ships (Objects)" },
    { id: '6', title: "Coral Maze (Arrays)" },
    { id: '7', title: "The Abyss (Recursion)" },
    { id: '8', title: "Ghost Ships (Debugging)" },
    { id: '9', title: "Tidal Waves (APIs)" },
    { id: '10', title: "Legendary Treasure (Capstone)" },
  ];

  return {
    title,
    chapters: baseChapters.map((ch, i) => ({
      ...ch,
      tasks: Array.from({ length: 8 }).map((_, ti) => ({
        id: `${lang}-${i}-${ti}`,
        type: ti % 3 === 0 ? 'choice' : ti % 3 === 1 ? 'type' : 'match',
        question: `${lang.toUpperCase()} ${ch.title} - Challenge ${ti + 1}: ${
          ti % 3 === 1 ? "Type the code for a " + (lang === 'java' ? 'System.out' : 'print') : "Identify the correct syntax"
        }`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: ti % 4 === 0 ? 0 : 1,
        correctText: lang === 'java' ? 'System.out.println' : 'print',
        pairs: { "Key": "Value", "Ship": "Sea" }
      }))
    })),
    careerTiers
  };
};

const PATHWAYS = {
  html: generatePath('html', "HTML Navigator", [
    { min: 0, roles: ["Content Intern", "QA Assistant"], level: "Cabin Boy" },
    { min: 3, roles: ["Email Developer", "SEO Specialist"], level: "Navigator" },
    { min: 7, roles: ["Junior Web Dev", "UI Implementer"], level: "First Mate" },
    { min: 10, roles: ["Full-Stack Pirate", "UX Architect"], level: "Legendary Captain" }
  ]),
  java: generatePath('java', "Java Galleon", [
    { min: 0, roles: ["Support Desk", "Junior Tester"], level: "Cabin Boy" },
    { min: 5, roles: ["Android Intern", "Java Associate"], level: "Navigator" },
    { min: 10, roles: ["Backend Engineer", "System Architect"], level: "Legendary Captain" }
  ]),
  python: generatePath('python', "Python Privateer", [
    { min: 0, roles: ["Data Entry", "Script Assistant"], level: "Cabin Boy" },
    { min: 5, roles: ["Data Analyst", "Automation Dev"], level: "Navigator" },
    { min: 10, roles: ["AI Engineer", "Lead Data Scientist"], level: "Legendary Captain" }
  ])
};

// --- Component Parts ---

const PirateCat = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-40 h-40'
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center animate-bounce duration-[3000ms]`}>
       {/* Note: In a real app, use your CWLogo.png. Using a placeholder SVG for now */}
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="55" r="40" fill="#FBBF24" />
          <path d="M20 35 Q50 10 80 35 L80 40 L20 40 Z" fill="#111827" />
          <circle cx="40" cy="45" r="5" fill="#1F2937" />
          <circle cx="60" cy="45" r="5" fill="#1F2937" />
          <path d="M40 65 Q50 75 60 65" stroke="#92400E" fill="none" strokeWidth="3" strokeLinecap="round" />
       </svg>
    </div>
  );
};

const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none bg-sky-300">
    <div className="absolute bottom-0 w-[200%] h-48 bg-blue-500/30 rounded-[100%] translate-y-24 animate-wave-slow"></div>
    <div className="absolute bottom-0 w-[200%] h-64 bg-blue-600/40 rounded-[100%] translate-y-32 animate-wave-reverse"></div>
    <div className="absolute bottom-40 left-1/4 animate-bob-slow">
      <Ship className="text-slate-800 w-24 h-24" />
    </div>
  </div>
);

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [user, setUser] = useState({ name: '', language: 'html', completedChapters: 0 });
  const [currentChapter, setCurrentChapter] = useState(0);
  const [activeTasks, setActiveTasks] = useState([]);
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [brigList, setBrigList] = useState([]);

  const path = PATHWAYS[user.language];
  const activeTask = activeTasks[currentTaskIdx];

  const playSound = (type) => {
    try {
        const msg = new SpeechSynthesisUtterance(type === 'correct' ? "Argh! Bullseye!" : "Scuppered!");
        msg.pitch = type === 'correct' ? 0.8 : 0.4;
        msg.rate = 1;
        window.speechSynthesis.speak(msg);
    } catch (e) {}
  };

  const startChapter = (idx) => {
    const chapterTasks = path.chapters[idx].tasks;
    setCurrentChapter(idx);
    setActiveTasks([...chapterTasks]);
    setBrigList([]);
    setCurrentTaskIdx(0);
    setWrongCount(0);
    setUserInput('');
    setFeedback(null);
    setScreen('quiz');
  };

  const handleNextTask = (isCorrect) => {
    if (isCorrect) {
      playSound('correct');
      setFeedback('correct');
      setWrongCount(0);
      setTimeout(() => {
        setFeedback(null);
        setUserInput('');
        advanceQuiz();
      }, 1000);
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      playSound('wrong');
      
      if (newWrong >= 2) {
        setFeedback('revealed');
        setBrigList(prev => [...prev, activeTask]);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  };

  const advanceQuiz = () => {
    if (currentTaskIdx < activeTasks.length - 1) {
      setCurrentTaskIdx(prev => prev + 1);
    } else if (brigList.length > 0) {
      setActiveTasks([...brigList]);
      setBrigList([]);
      setCurrentTaskIdx(0);
      setWrongCount(0);
    } else {
      setUser(prev => ({ ...prev, completedChapters: Math.max(prev.completedChapters, currentChapter + 1) }));
      setScreen('jobs');
    }
  };

  const getJobsForLevel = () => {
    const tier = [...path.careerTiers].reverse().find(t => user.completedChapters >= t.min);
    return tier || path.careerTiers[0];
  };

  return (
    <div className="min-h-screen font-sans">
      <style>{`
        @keyframes wave { 0% { transform: translateX(-50%) translateY(24px); } 100% { transform: translateX(0%) translateY(24px); } }
        @keyframes bob { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-20px) rotate(5deg); } }
        .animate-wave-slow { animation: wave 10s linear infinite; }
        .animate-wave-reverse { animation: wave 7s linear infinite reverse; }
        .animate-bob-slow { animation: bob 4s ease-in-out infinite; }
      `}</style>

      {screen === 'landing' && (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          <AnimatedBackground />
          <div className="bg-white/90 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border-4 border-white max-w-lg">
            <div className="flex justify-center mb-6"><PirateCat size="lg" /></div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-700 mt-0 mb-4 tracking-tighter uppercase italic">Captain Whiskers</h1>
            <p className="text-xl text-slate-600 mb-10 font-bold italic">Level up your code, unlock the career chest!</p>
            <button 
              onClick={() => setScreen('signup')}
              className="bg-amber-500 hover:bg-amber-600 text-white text-2xl font-black py-6 px-16 rounded-3xl shadow-[0_8px_0_0_#b45309] transition-all active:translate-y-2 active:shadow-none"
            >
              START THE VOYAGE
            </button>
          </div>
        </div>
      )}

      {screen === 'signup' && (
        <div className="min-h-screen bg-sky-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black text-slate-800 mb-8 text-center uppercase italic">The Registry</h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Captain Name</label>
                <input 
                  type="text" 
                  value={user.name}
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-sky-500 outline-none text-xl font-bold"
                  placeholder="Ex: Peg-Leg Programmer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Choose Bounty</label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.keys(PATHWAYS).map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setUser({...user, language: lang})}
                      className={`p-4 rounded-2xl border-4 font-black uppercase text-left flex items-center justify-between transition-all ${user.language === lang ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-50 text-slate-300'}`}
                    >
                      {lang} {user.language === lang && <CheckCircle />}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setScreen('dashboard')} className="w-full bg-sky-500 text-white font-black py-6 rounded-3xl shadow-[0_6px_0_0_#0369a1] active:translate-y-1 active:shadow-none transition-all">CAST OFF</button>
            </div>
          </div>
        </div>
      )}

      {screen === 'dashboard' && (
        <div className="min-h-screen bg-slate-50 pb-20">
          <nav className="bg-white px-8 py-4 border-b-2 flex justify-between items-center sticky top-0 z-50">
             <div className="flex items-center gap-3 font-black text-2xl italic text-slate-800" onClick={() => setScreen('landing')}>
               <PirateCat size="sm" /> <span>Captain Whiskers</span>
             </div>
             <div className="flex items-center gap-8">
               <div className="hidden sm:flex items-center gap-2 text-emerald-500 font-black">
                 <Gem size={20} /> {user.completedChapters * 100} Doubloons
               </div>
               <button onClick={() => setScreen('jobs')} className="bg-slate-800 text-white px-6 py-2 rounded-full font-black text-xs uppercase hover:bg-slate-700 transition-colors">The Chest</button>
             </div>
          </nav>

          <main className="max-w-3xl mx-auto py-12 px-6">
            <div className="bg-sky-500 text-white p-10 rounded-[3rem] mb-12 shadow-xl flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                 <h2 className="text-4xl font-black mb-2 uppercase italic">{path.title}</h2>
                 <p className="font-bold opacity-80">Sea of {user.language.toUpperCase()}</p>
              </div>
              <Ship size={120} className="absolute -right-4 -bottom-4 opacity-20 rotate-12" />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {path.chapters.map((ch, idx) => (
                <div key={ch.id} className={`bg-white p-8 rounded-3xl border-2 transition-all flex items-center justify-between ${idx <= user.completedChapters ? 'border-sky-100 shadow-md' : 'opacity-50 grayscale border-slate-100'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${idx < user.completedChapters ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {idx < user.completedChapters ? <CheckCircle /> : idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{ch.title}</h3>
                      <p className="text-slate-400 font-bold text-sm">Tasks: {ch.tasks.length}</p>
                    </div>
                  </div>
                  {idx === user.completedChapters ? (
                    <button 
                      onClick={() => startChapter(idx)}
                      className="bg-sky-500 text-white px-8 py-4 rounded-2xl font-black shadow-[0_4px_0_0_#0369a1] hover:scale-105 active:translate-y-1 active:shadow-none transition-all"
                    >
                      CONTINUE
                    </button>
                  ) : idx < user.completedChapters ? (
                    <div className="text-emerald-500 font-black flex items-center gap-2"><Trophy /> MASTERED</div>
                  ) : (
                    <Lock className="text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {screen === 'quiz' && activeTask && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col">
          <div className="p-8 flex items-center gap-6 border-b-2">
            <button onClick={() => setScreen('dashboard')} className="text-slate-300 hover:text-slate-600 transition-colors"><X size={32} /></button>
            <div className="flex-grow h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full transition-all duration-500" style={{ width: `${(currentTaskIdx / activeTasks.length) * 100}%` }}></div>
            </div>
            <span className="font-black text-slate-400 whitespace-nowrap">{currentTaskIdx + 1}/{activeTasks.length}</span>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center p-8 bg-slate-50/30 overflow-y-auto">
             <div className="max-w-2xl w-full">
               <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-12 text-center leading-tight">
                 {activeTask.question}
               </h2>

               {activeTask.type === 'choice' && (
                 <div className="grid grid-cols-1 gap-4">
                   {activeTask.options.map((opt, i) => (
                     <button 
                      key={i} 
                      onClick={() => handleNextTask(i === activeTask.correct)}
                      className="w-full p-6 text-left border-2 border-slate-200 rounded-2xl font-bold text-xl hover:bg-sky-50 hover:border-sky-500 transition-all shadow-sm bg-white"
                     >
                       {opt}
                     </button>
                   ))}
                 </div>
               )}

               {activeTask.type === 'type' && (
                 <div className="space-y-4">
                   <input 
                     autoFocus
                     type="text" 
                     value={userInput}
                     onChange={(e) => setUserInput(e.target.value)}
                     className="w-full p-6 text-2xl font-mono bg-slate-900 text-emerald-400 rounded-3xl outline-none shadow-xl"
                     placeholder="Type the answer..."
                     onKeyDown={(e) => e.key === 'Enter' && handleNextTask(userInput.trim().toLowerCase() === activeTask.correctText.toLowerCase())}
                   />
                   <button 
                    onClick={() => handleNextTask(userInput.trim().toLowerCase() === activeTask.correctText.toLowerCase())} 
                    className="w-full bg-emerald-500 text-white font-black py-6 rounded-3xl text-2xl shadow-[0_6px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all"
                   >
                     SUBMIT
                   </button>
                 </div>
               )}

               {activeTask.type === 'match' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-10 bg-slate-100 rounded-3xl font-black text-3xl text-center border-2 border-slate-200">
                      {Object.keys(activeTask.pairs)[0]}
                   </div>
                   <button 
                    onClick={() => handleNextTask(true)} 
                    className="p-10 border-4 border-dashed border-slate-200 rounded-3xl font-bold text-xl hover:border-sky-500 hover:bg-sky-50 transition-all bg-white"
                   >
                     Match with "{Object.values(activeTask.pairs)[0]}"
                   </button>
                 </div>
               )}
             </div>
          </div>

          {feedback && (
            <div className={`fixed bottom-0 left-0 right-0 p-8 flex items-center justify-between border-t-8 animate-in slide-in-from-bottom duration-300 z-[110] ${
              feedback === 'correct' ? 'bg-emerald-100 border-emerald-500' : feedback === 'revealed' ? 'bg-amber-100 border-amber-500' : 'bg-rose-100 border-rose-500'
            }`}>
              <div className="flex items-center gap-6">
                <div className="bg-white p-3 rounded-full shadow-lg">
                  {feedback === 'correct' ? <Trophy className="text-emerald-500" /> : feedback === 'revealed' ? <HelpCircle className="text-amber-500" /> : <Skull className="text-rose-500" />}
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase italic leading-none">{feedback === 'correct' ? 'Bullseye!' : feedback === 'revealed' ? 'To the Brig!' : 'Scuppered!'}</h4>
                  <p className="font-bold opacity-70 text-sm">{feedback === 'revealed' ? `The answer was "${activeTask.correctText}". Re-testing later!` : 'Sail on!'}</p>
                </div>
              </div>
              {feedback === 'revealed' && (
                <button onClick={() => { setFeedback(null); setUserInput(''); advanceQuiz(); }} className="bg-amber-500 text-white px-8 py-3 rounded-xl font-black uppercase text-sm">CONTINUE</button>
              )}
            </div>
          )}
        </div>
      )}

      {screen === 'jobs' && (
        <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="flex justify-center mb-6"><PirateCat size="lg" /></div>
            <h2 className="text-4xl font-black text-slate-800 mb-2 italic uppercase">The Captain's Chest</h2>
            <div className="inline-block px-6 py-2 bg-sky-100 text-sky-700 rounded-full font-black text-xs uppercase tracking-widest mb-10">
              Rank: {getJobsForLevel().level}
            </div>

            <div className="space-y-4 mb-10 text-left">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Unlocked Bounties</h3>
              {getJobsForLevel().roles.map((role, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedJob(role)}
                  className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-transparent hover:border-sky-500 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-sky-500 group-hover:text-white transition-colors">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 tracking-tight">{role}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase italic">Entry Level Bounty</p>
                    </div>
                  </div>
                  <ExternalLink size={18} className="text-slate-300 group-hover:text-sky-500" />
                </button>
              ))}
            </div>

            <button 
              onClick={() => setScreen('dashboard')}
              className="w-full py-5 bg-slate-800 text-white font-black text-lg rounded-2xl shadow-[0_6px_0_0_#1e293b] active:translate-y-1 active:shadow-none transition-all uppercase"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-2xl mx-auto mb-6 flex items-center justify-center"><ExternalLink size={40}/></div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">Ready to Apply?</h4>
            <p className="text-slate-500 text-sm mb-8 italic">Finding <span className="text-sky-600 font-bold underline">{selectedJob}</span> roles on the horizon.</p>
            <div className="space-y-3">
              <button 
                onClick={() => { window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(selectedJob)}`, '_blank'); setSelectedJob(null); }}
                className="w-full py-4 bg-sky-500 text-white font-black rounded-xl shadow-[0_4px_0_0_#0369a1] active:translate-y-1 active:shadow-none transition-all"
              >
                SET SAIL!
              </button>
              <button onClick={() => setSelectedJob(null)} className="w-full py-4 text-slate-400 font-black uppercase text-xs">MAYBE LATER</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}