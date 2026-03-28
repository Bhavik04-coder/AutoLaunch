'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './agents.module.scss';
import ReactMarkdown from 'react-markdown';

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const VISUAL_PROMPT_BUILDER_ID = '5';

interface AgentData {
  id: string;
  name: string;
  role: string;
  image: string;
  status: 'active' | 'idle';
  tasksThisWeek: number;
  openTickets: number;
  successRate: number;
  avgResolution: string;
  lastActivity: string;
  prompt: string;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

type PromptBuilderStep = 'idle' | 'analyzing' | 'asking' | 'generating' | 'done';
interface PromptBuilderState {
  step: PromptBuilderStep;
  initialPrompt: string;
  questions: string[];
  activeQuestionIndex: number;
  answers: Record<string, string>;
  result: { positive_prompt: string; negative_prompt: string } | null;
}
const INITIAL_PB_STATE: PromptBuilderState = {
  step: 'idle', initialPrompt: '', questions: [], activeQuestionIndex: 0, answers: {}, result: null,
};

const AGENTS_DATA: AgentData[] = [
  {
    id: '1',
    name: 'Echo',
    role: 'Content Writer',
    image: '/agents_imgs/agent1.png',
    status: 'active',
    tasksThisWeek: 1,
    openTickets: 1,
    successRate: 94,
    avgResolution: '1 Day',
    lastActivity: 'Generated LinkedIn post for product launch',
    prompt: 'You are a social media content writer. Help the user create engaging, platform-optimized posts. Keep responses concise and actionable.',
  },
  {
    id: '2',
    name: 'Spark',
    role: 'Marketing Agent',
    image: '/agents_imgs/agent2.png',
    status: 'active',
    tasksThisWeek: 1,
    openTickets: 1,
    successRate: 91,
    avgResolution: '1 Day',
    lastActivity: 'Optimized hashtag set for Instagram campaign',
    prompt: "You are a hashtag strategy expert. Suggest relevant, trending hashtags for the user's content. Group them by reach (broad, niche, branded). Keep it concise.",
  },
  {
    id: '3',
    name: 'Fixr',
    role: 'Analytics Agent',
    image: '/agents_imgs/agent3.png',
    status: 'active',
    tasksThisWeek: 1,
    openTickets: 1,
    successRate: 88,
    avgResolution: '1 Day',
    lastActivity: 'Analyzed engagement patterns for Q1 report',
    prompt: 'You are a social media engagement analyst. Help the user understand what content patterns drive the most engagement. Give specific, data-driven advice.',
  },
  {
    id: '4',
    name: 'Closi',
    role: 'Trend Spotter',
    image: '/agents_imgs/agent4.png',
    status: 'active',
    tasksThisWeek: 1,
    openTickets: 1,
    successRate: 87,
    avgResolution: '1 Day',
    lastActivity: 'Identified 3 viral trends in the tech niche',
    prompt: 'You are a trend analysis expert. Help the user identify trending topics and viral content opportunities in their niche. Be specific and timely.',
  },
  {
    id: VISUAL_PROMPT_BUILDER_ID,
    name: 'Nabr',
    role: 'Visual Prompt Builder',
    image: '/agents_imgs/agent5.png',
    status: 'active',
    tasksThisWeek: 1,
    openTickets: 1,
    successRate: 96,
    avgResolution: '1 Day',
    lastActivity: 'Generated ComfyUI prompt for product banner',
    prompt: 'visual-prompt-builder',
  },
  {
    id: '6',
    name: 'Ledgr',
    role: 'Scheduler Agent',
    image: '/agents_imgs/agent2.png',
    status: 'idle',
    tasksThisWeek: 1,
    openTickets: 1,
    successRate: 92,
    avgResolution: '1 Day',
    lastActivity: 'Scheduled 12 posts across 4 platforms',
    prompt: 'You are a content scheduling expert. Help users plan and optimize their posting schedule for maximum engagement. Consider time zones, platform algorithms, and audience behavior.',
  },
];

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ agent, isActive, onOpen }: { agent: AgentData; isActive: boolean; onOpen: () => void }) {
  return (
    <div
      className={`${styles.agentCard} ${isActive ? styles.agentCardActive : ''}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div className={styles.cardHeader}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={agent.image} alt={agent.name} className={styles.avatar} />
        <div className={styles.agentMeta}>
          <div className={styles.agentName}>{agent.name}</div>
          <div className={styles.agentRole}>{agent.role}</div>
        </div>
        <span className={agent.status === 'active' ? styles.activeBadge : styles.idleBadge}>
          {agent.status === 'active' ? '● Active' : '○ Idle'}
        </span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Task this week</span>
          <span className={styles.statValue}>{agent.tasksThisWeek}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Open Ticket</span>
          <span className={styles.statValue}>{agent.openTickets}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Success Rate</span>
          <span className={styles.statValue}>{agent.successRate}%</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Avg. Resolution</span>
          <span className={styles.statValue}>{agent.avgResolution}</span>
        </div>
      </div>

      <div className={styles.lastActivity}>
        <span className={styles.lastActivityLabel}>Last Activity</span>
        <p className={styles.lastActivityText}>
          <strong>Completed</strong> {agent.lastActivity}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AgentsComponent() {
  const [activeAgent, setActiveAgent] = useState<AgentData | null>(null);
  const [agents, setAgents] = useState(AGENTS_DATA);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [imgPrompt, setImgPrompt] = useState('');
  const [generatedImgs, setGeneratedImgs] = useState<string[]>([]);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imgError, setImgError] = useState('');
  const [imgStyle, setImgStyle] = useState('realistic');

  const [pb, setPb] = useState<PromptBuilderState>(INITIAL_PB_STATE);
  const [pbCopied, setPbCopied] = useState('');

  const IMG_STYLES = ['realistic', 'anime', 'digital art', 'oil painting', 'watercolor', 'cinematic', 'minimalist', '3D render'];
  const isPromptBuilder = activeAgent?.id === VISUAL_PROMPT_BUILDER_ID;

  const handleGenerateImage = async () => {
    if (!imgPrompt.trim()) return;
    setIsGeneratingImg(true);
    setImgError('');
    try {
      const styledPrompt = `${imgPrompt.trim()}, ${imgStyle} style`;
      const encoded = encodeURIComponent(styledPrompt);
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });
      setGeneratedImgs((prev) => [url, ...prev].slice(0, 6));
    } catch {
      setImgError('Generation failed. Try a different prompt.');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openAgent = (agent: AgentData) => {
    setActiveAgent(agent);
    setPb(INITIAL_PB_STATE);
    if (agent.id === VISUAL_PROMPT_BUILDER_ID) {
      setMessages([]);
    } else {
      setMessages([{ role: 'assistant', text: `Hi! I'm ${agent.name}, your ${agent.role}. How can I help you today?` }]);
    }
    setMessage('');
  };

  const closeChat = () => {
    setActiveAgent(null);
    setMessages([]);
    setPb(INITIAL_PB_STATE);
  };

  const pbAnalyze = async (idea: string) => {
    setPb((prev) => ({ ...prev, step: 'analyzing', initialPrompt: idea }));
    setMessages((prev) => [...prev, { role: 'user', text: idea }, { role: 'assistant', text: '🔍 Analyzing your idea...' }]);
    setIsLoading(true);
    try {
      const res = await fetch('/api/prompt-enhancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', initialPrompt: idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      const questions: string[] = data.questions ?? [];
      if (questions.length === 0) throw new Error('No clarifying questions generated.');
      setPb((prev) => ({ ...prev, step: 'asking', questions, activeQuestionIndex: 0 }));
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: `Great! I need a few details to craft the perfect prompt. **Question 1 of ${questions.length}:**` },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setPb((prev) => ({ ...prev, step: 'idle' }));
      setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', text: `⚠️ ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const pbAnswerQuestion = async (answer: string) => {
    const q = pb.questions[pb.activeQuestionIndex];
    const newAnswers = { ...pb.answers, [q]: answer };
    const nextIdx = pb.activeQuestionIndex + 1;
    setMessages((prev) => [...prev, { role: 'user', text: answer }]);
    if (nextIdx >= pb.questions.length) {
      setPb((prev) => ({ ...prev, answers: newAnswers, activeQuestionIndex: nextIdx, step: 'generating' }));
      setMessages((prev) => [...prev, { role: 'assistant', text: '✨ All questions answered! Generating your ComfyUI prompts...' }]);
      setIsLoading(true);
      try {
        const res = await fetch('/api/prompt-enhancer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate', initialPrompt: pb.initialPrompt, qaPairs: newAnswers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Generation failed');
        setPb((prev) => ({ ...prev, step: 'done', result: data }));
        setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', text: '__PROMPT_RESULT__' }]);
        setAgents((prev) => prev.map((a) => a.id === VISUAL_PROMPT_BUILDER_ID ? { ...a, tasksThisWeek: a.tasksThisWeek + 1 } : a));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Something went wrong.';
        setPb((prev) => ({ ...prev, step: 'asking', activeQuestionIndex: pb.activeQuestionIndex }));
        setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', text: `⚠️ ${msg}` }]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setPb((prev) => ({ ...prev, answers: newAnswers, activeQuestionIndex: nextIdx }));
      setMessages((prev) => [...prev, { role: 'assistant', text: `**Question ${nextIdx + 1} of ${pb.questions.length}:**` }]);
    }
  };

  const pbReset = () => { setPb(INITIAL_PB_STATE); setMessages([]); };

  const pbHandleSend = () => {
    if (!message.trim() || isLoading) return;
    const text = message.trim();
    setMessage('');
    if (pb.step === 'idle') pbAnalyze(text);
    else if (pb.step === 'asking') pbAnswerQuestion(text);
  };

  const pbCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setPbCopied(key);
    setTimeout(() => setPbCopied(''), 2000);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !activeAgent) return;
    if (isPromptBuilder) { pbHandleSend(); return; }
    const userText = message.trim();
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);
    const history = messages.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    const fullPrompt = `${activeAgent.prompt}\n\n${history}\nUser: ${userText}\nAssistant:`;
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2', prompt: fullPrompt, stream: false }),
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      const data = await res.json();
      const reply = data.response?.trim() || 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setAgents((prev) => prev.map((a) => a.id === activeAgent.id ? { ...a, tasksThisWeek: a.tasksThisWeek + 1 } : a));
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `⚠️ Could not reach Ollama: ${err.message}. Make sure Ollama is running with \`ollama run llama3.2\`.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition is not supported in your browser. Try Chrome.'); return; }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setMessage(transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        {/* Left: Agent grid */}
        <div className={styles.agentsList}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>All agents</h1>
            <button type="button" className={styles.orchestrationBtn}>
              Agent Orchestration
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className={styles.agentsGrid}>
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={activeAgent?.id === agent.id}
                onOpen={() => openAgent(agent)}
              />
            ))}
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className={`${styles.chatPanel} ${activeAgent ? styles.open : ''}`}>
          <div className={styles.panelTabs}>
            <button type="button" className={`${styles.panelTab} ${activeTab === 'chat' ? styles.panelTabActive : ''}`} onClick={() => setActiveTab('chat')}>
              💬 Chat
            </button>
            <button type="button" className={`${styles.panelTab} ${activeTab === 'image' ? styles.panelTabActive : ''}`} onClick={() => setActiveTab('image')}>
              🎨 Image Gen
            </button>
            <button type="button" className={styles.closeChat} onClick={closeChat} aria-label="Close">✕</button>
          </div>

          {activeTab === 'chat' && (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatTitleGroup}>
                  {activeAgent && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={activeAgent.image} alt={activeAgent.name} className={styles.chatAvatar} />
                  )}
                  <div>
                    <h3 className={styles.chatTitle}>{activeAgent?.name ?? 'AI Agent'}</h3>
                    <p className={styles.chatSubtitle}>{activeAgent?.role}</p>
                  </div>
                </div>
              </div>
              <div className={styles.chatMessages}>
                {isPromptBuilder && messages.length === 0 && pb.step === 'idle' && (
                  <div className={styles.promptBuilderWelcome}>
                    <div className={styles.promptBuilderWelcomeTitle}>🎨 Visual Prompt Builder</div>
                    <p className={styles.promptBuilderWelcomeDesc}>
                      Describe your feature idea or content brief and I&apos;ll guide you through creating a detailed ComfyUI prompt.
                    </p>
                    <p className={styles.promptBuilderWelcomeDesc}>
                      <em>Tip: Include a preferred color palette in your message for better results!</em>
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  if (msg.text === '__PROMPT_RESULT__' && pb.result) {
                    return (
                      <div key={i} className={styles.promptOutputCard}>
                        <div className={styles.promptSuccessHeader}>✅ ComfyUI Prompts Ready</div>
                        <div className={styles.promptBlock}>
                          <div className={`${styles.promptLabel} ${styles.promptLabelPositive}`}>
                            <span>✦ Positive Prompt</span>
                            <button type="button" className={`${styles.promptCopyBtn} ${pbCopied === 'pos' ? styles.promptCopied : ''}`} onClick={() => pbCopy(pb.result!.positive_prompt, 'pos')}>
                              {pbCopied === 'pos' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                          <pre className={styles.promptText}>{pb.result.positive_prompt}</pre>
                        </div>
                        <div className={styles.promptBlock}>
                          <div className={`${styles.promptLabel} ${styles.promptLabelNegative}`}>
                            <span>✗ Negative Prompt</span>
                            <button type="button" className={`${styles.promptCopyBtn} ${pbCopied === 'neg' ? styles.promptCopied : ''}`} onClick={() => pbCopy(pb.result!.negative_prompt, 'neg')}>
                              {pbCopied === 'neg' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                          <pre className={styles.promptText}>{pb.result.negative_prompt}</pre>
                        </div>
                        <div className={styles.promptActions}>
                          <button type="button" className={styles.promptResetBtn} onClick={pbReset}>🔄 Start Over</button>
                        </div>
                      </div>
                    );
                  }

                  if (isPromptBuilder && pb.step === 'asking' && msg.role === 'assistant' && msg.text.startsWith('**Question')) {
                    const qIdx = pb.questions.findIndex((_, qi) => msg.text.includes(`Question ${qi + 1} of`));
                    const question = qIdx >= 0 ? pb.questions[qIdx] : null;
                    return (
                      <div key={i} className={`${styles.message} ${styles.assistant}`}>
                        <span className={styles.promptStepBadge}>Step 2 · Clarify Details</span>
                        <ReactMarkdown components={{
                          p: ({ children }) => <p className={styles.mdP}>{children}</p>,
                          strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                        }}>
                          {msg.text}
                        </ReactMarkdown>
                        {question && <p className={styles.promptQuestion}>{question}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown components={{
                          p: ({ children }) => <p className={styles.mdP}>{children}</p>,
                          ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
                          ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
                          li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
                          strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                          em: ({ children }) => <em className={styles.mdEm}>{children}</em>,
                          code: ({ children }) => <code className={styles.mdCode}>{children}</code>,
                          pre: ({ children }) => <pre className={styles.mdPre}>{children}</pre>,
                          h1: ({ children }) => <h1 className={styles.mdH}>{children}</h1>,
                          h2: ({ children }) => <h2 className={styles.mdH}>{children}</h2>,
                          h3: ({ children }) => <h3 className={styles.mdH}>{children}</h3>,
                        }}>
                          {msg.text}
                        </ReactMarkdown>
                      ) : msg.text}
                    </div>
                  );
                })}
                {isLoading && (
                  <div className={`${styles.message} ${styles.assistant}`}>
                    <span className={styles.typing}><span /><span /><span /></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className={styles.chatInput}>
                <input
                  type="text"
                  placeholder={
                    isPromptBuilder
                      ? pb.step === 'idle' ? 'Describe your feature idea...'
                        : pb.step === 'asking' ? 'Type your answer...'
                          : pb.step === 'done' ? 'Click Start Over for a new prompt.'
                            : 'Processing...'
                      : `Ask ${activeAgent?.name ?? 'the agent'} anything...`
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className={styles.input}
                  disabled={isLoading || (isPromptBuilder && (pb.step === 'done' || pb.step === 'analyzing' || pb.step === 'generating'))}
                />
                {!isPromptBuilder && (
                  <button type="button" aria-label={isRecording ? 'Stop recording' : 'Start voice input'} className={`${styles.micBtn} ${isRecording ? styles.micActive : ''}`} onClick={toggleMic} disabled={isLoading}>
                    {isRecording ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                )}
                <button type="button" className={styles.sendBtn} onClick={sendMessage} aria-label="Send message" disabled={isLoading || !message.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {activeTab === 'image' && (
            <div className={styles.imgGenPanel}>
              <div className={styles.imgGenTop}>
                <p className={styles.imgGenLabel}>Style</p>
                <div className={styles.imgStyleGrid}>
                  {IMG_STYLES.map((s) => (
                    <button key={s} type="button" className={`${styles.imgStyleBtn} ${imgStyle === s ? styles.imgStyleActive : ''}`} onClick={() => setImgStyle(s)}>
                      {s}
                    </button>
                  ))}
                </div>
                <p className={styles.imgGenLabel}>Prompt</p>
                <div className={styles.imgGenRow}>
                  <input
                    type="text"
                    className={styles.imgPromptInput}
                    placeholder="Describe your image..."
                    value={imgPrompt}
                    onChange={(e) => setImgPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                  />
                  <button type="button" className={styles.imgGenBtn} onClick={handleGenerateImage} disabled={isGeneratingImg || !imgPrompt.trim()}>
                    {isGeneratingImg ? <span className={styles.imgSpinner} /> : '✦'}
                  </button>
                </div>
                {imgError && <p className={styles.imgError}>{imgError}</p>}
                {isGeneratingImg && (
                  <div className={styles.imgPlaceholder}>
                    <span className={styles.imgLoadingDots}><span /><span /><span /></span>
                    <p>Generating...</p>
                  </div>
                )}
              </div>
              {generatedImgs.length > 0 && (
                <div className={styles.imgGrid}>
                  {generatedImgs.map((url, i) => (
                    <div key={i} className={styles.imgThumbWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Generated ${i + 1}`} className={styles.imgThumb} />
                      <div className={styles.imgThumbActions}>
                        <a href={url} download={`image-${i + 1}.jpg`} target="_blank" rel="noreferrer" className={styles.imgThumbBtn}>⬇</a>
                        <button type="button" className={styles.imgThumbBtn} onClick={() => setGeneratedImgs((p) => p.filter((_, j) => j !== i))}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
