import React, { useState } from 'react';
import { Play, Sparkles, Code2, Cpu, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3001';

const VersionCard = ({ version }) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full transform transition-all duration-300">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
          {version.id === 1 ? <Code2 size={20} /> : version.id === 2 ? <Sparkles size={20} /> : <CheckCircle2 size={20} />}
          {version.title}
        </h3>
      </div>
      <div className="p-5 flex-grow flex flex-col gap-4">
        <div className="flex-1">
          <div className="text-sm tracking-widest font-medium text-zinc-400 mb-2 uppercase">Generated Opinion</div>
          <div className="rounded-xl overflow-hidden border border-white/10 shadow-inner bg-zinc-900 overflow-y-auto max-h-[300px]">
            <div className="p-5 text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">
              {version.opinion || 'Generating...'}
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm tracking-widest font-medium text-zinc-400 mb-2 uppercase">Changelog / Critique</div>
          <ul className="space-y-2 text-sm text-zinc-300 list-none p-4 rounded-xl bg-white/5 border border-white/5">
            {version.changelog.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">▹</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [prompt, setPrompt] = useState('Should humanity prioritize space exploration or ocean exploration?');
  const [versions, setVersions] = useState([]);
  const [loopStatus, setLoopStatus] = useState({ state: 'idle', currentStep: '' });

  const runLoopProcess = async () => {
    if (!prompt.trim()) return;
    setLoopStatus({ state: 'running', currentStep: 'Initializing brightdata context...' });
    setVersions([]);
    
    try {
      // In a real streaming app, this would use SSE or websockets to update progress.
      // Here we wait for the full loop, but update status.
      setLoopStatus({ state: 'running', currentStep: 'Generator is thinking...' });
      const res = await axios.post(`${SERVER_URL}/api/loop`, { prompt });
      setVersions(res.data.versions);
      setLoopStatus({ state: 'completed', currentStep: 'Loop finished.' });
    } catch (err) {
      console.error(err);
      setLoopStatus({ state: 'error', currentStep: 'Failed to run loop.' });
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      
      {/* Sidebar background decoration */}
      <div className="absolute top-0 left-[-20%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-80 glass-panel border-r border-white/5 flex flex-col z-10 sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="text-emerald-400" size={28} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">AutoAgent</h1>
          </div>
          <p className="text-sm text-zinc-400">Autonomous Self-Improving Loop</p>
        </div>

        <div className="p-8 flex-1 flex flex-col gap-8">
          <div className="space-y-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Task Prompt</label>
            <textarea
              className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none shadow-inner"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your task here..."
            />
            <button
              onClick={runLoopProcess}
              disabled={loopStatus.state === 'running'}
              className="w-full group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {loopStatus.state === 'running' ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
              <span className="relative z-10">{loopStatus.state === 'running' ? 'Executing Loop...' : 'Launch Agent Loop'}</span>
            </button>
          </div>

          <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 pl-1">Process Status</h2>
            <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
              {[
                { id: 1, label: '1. Generation', done: versions.length > 0 },
                { id: 2, label: '2. Critique', done: versions.length > 1 },
                { id: 3, label: '3. Refinement', done: versions.length > 2 }
              ].map(step => (
                <div key={step.id} className="flex items-center justify-between group">
                  <span className={`text-sm transition-colors ${step.done ? 'text-zinc-200' : 'text-zinc-500'}`}>{step.label}</span>
                  <div className="flex items-center">
                    {step.done ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden">
              <div className="flex items-center space-x-3 relative z-10">
                <div className={`w-2.5 h-2.5 rounded-full ${loopStatus.state === 'running' ? 'bg-amber-400 status-pulse' : loopStatus.state === 'completed' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                <span className="text-sm font-medium text-zinc-300">
                  {loopStatus.state === 'idle' ? 'System Idle' : loopStatus.state === 'running' ? 'Processing...' : 'Loop Completed'}
                </span>
              </div>
              <div className="mt-2 text-xs text-zinc-500 font-mono relative z-10">
                {loopStatus.currentStep || 'Awaiting input...'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 z-10 overflow-auto h-screen relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Evolution Timeline</h2>
              <p className="text-zinc-400 text-sm">Visualizing the critique and refinement cycles</p>
            </div>
            <div className="px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-sm">
              Model: Llama-3-8B-Instruct
            </div>
          </div>

          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-white/5 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
              <div className="p-6 bg-zinc-800/50 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <Cpu size={48} className="text-emerald-400/50 relative z-10" />
              </div>
              <h3 className="text-xl font-medium text-zinc-300 mb-2">Awaiting Initiative</h3>
              <p className="text-zinc-500 max-w-sm">Enter a prompt in the sidebar and launch the agent loop to witness the evolution process.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {versions.map((version, index) => (
                <div key={version.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <VersionCard version={version} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
