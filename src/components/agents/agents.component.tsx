'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './agents.module.scss';
import ReactMarkdown from 'react-markdown';

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'idle';
  runs: number;
  prompt: string;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
}

const VISUAL_PROMPT_BUILDER_ID = '5';

const AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Content Writer',
    description: 'Generates engaging social media posts from your ideas',
    status: 'active',
    runs: 142,
    prompt: 'You are a social media content writer. Help the user create engaging, platform-optimized posts. Keep responses concise and actionable.',
  },
  {
    id: '2',
    name: 'Hashtag Optimizer',
    description: 'Finds the best hashtags for maximum reach',
    status: 'active',
    runs: 89,
    prompt: 'You are a hashtag strategy expert. Suggest relevant, trending hashtags for the user\'s content. Group them by reach (broad, niche, branded). Keep it concise.',
  },
  {
    id: '3',
    name: 'Engagement Analyzer',
    description: 'Analyzes your best performing content patterns',
    status: 'idle',
    runs: 34,
    prompt: 'You are a social media engagement analyst. Help the user understand what content patterns drive the most engagement. Give specific, data-driven advice.',
  },
  {
    id: '4',
    name: 'Trend Spotter',
    description: 'Monitors trending topics relevant to your niche',
    status: 'idle',
    runs: 12,
    prompt: 'You are a trend analysis expert. Help the user identify trending topics and viral content opportunities in their niche. Be specific and timely.',
  },
  {
    id: VISUAL_PROMPT_BUILDER_ID,
    name: 'Visual Prompt Builder',
    description: 'Creates detailed ComfyUI prompts from your feature ideas',
    status: 'active',
    runs: 0,
    prompt: 'visual-prompt-builder',
  },
];

// ── Prompt Builder types ─────────────────────────────────────────────────────
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
  step: 'idle',
  initialPrompt: '',
  questions: [],
  activeQuestionIndex: 0,
  answers: {},
  result: null,
};

export function AgentsComponent() {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState(AGENTS);
  const [activeTab, setActiveTab] = useState<'chat' | 'image'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Image generation state
  const [imgPrompt, setImgPrompt] = useState('');
  const [generatedImgs, setGeneratedImgs] = useState<string[]>([]);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imgError, setImgError] = useState('');
  const [imgStyle, setImgStyle] = useState('realistic');

  // Visual Prompt Builder state
  const [pb, setPb] = useState<PromptBuilderState>(INITIAL_PB_STATE);
  const [pbCopied, setPbCopied] = useState('');

  const IMG_STYLES = ['realistic', 'anime', 'digital art', 'oil painting', 'watercolor', 'cinematic', 'minimalist', '3D render'];

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

  const isPromptBuilder = activeAgent?.id === VISUAL_PROMPT_BUILDER_ID;

  const openAgent = (agent: Agent) => {
    setActiveAgent(agent);
    setPb(INITIAL_PB_STATE);
    if (agent.id === VISUAL_PROMPT_BUILDER_ID) {
      setMessages([]);
    } else {
      setMessages([
        {
          role: 'assistant',
          text: `Hi! I'm the ${agent.name} agent. ${agent.description}. How can I help you today?`,
        },
      ]);
    }
    setMessage('');
  };

  const closeChat = () => {
    setActiveAgent(null);
    setMessages([]);
    setPb(INITIAL_PB_STATE);
  };

  // ── Prompt Builder handlers ──────────────────────────────────────────────
  const pbAnalyze = async (idea: string) => {
    setPb((prev) => ({ ...prev, step: 'analyzing', initialPrompt: idea }));
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: idea },
      { role: 'assistant', text: '🔍 Analyzing your idea...' },
    ]);
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
        ...prev.slice(0, -1), // remove "Analyzing..." placeholder
        { role: 'assistant', text: `Great! I need a few details to craft the perfect prompt. **Question 1 of ${questions.length}:**` },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setPb((prev) => ({ ...prev, step: 'idle' }));
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: `⚠️ ${msg}` },
      ]);
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
      // All questions answered — generate!
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
        setMessages((prev) => [
          ...prev.slice(0, -1), // remove "Generating..." placeholder
          { role: 'assistant', text: '__PROMPT_RESULT__' },
        ]);
        // Increment run count
        setAgents((prev) => prev.map((a) => a.id === VISUAL_PROMPT_BUILDER_ID ? { ...a, runs: a.runs + 1, status: 'active' } : a));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Something went wrong.';
        setPb((prev) => ({ ...prev, step: 'asking', activeQuestionIndex: pb.activeQuestionIndex }));
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', text: `⚠️ ${msg}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Next question
      setPb((prev) => ({ ...prev, answers: newAnswers, activeQuestionIndex: nextIdx }));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `**Question ${nextIdx + 1} of ${pb.questions.length}:**` },
      ]);
    }
  };

  const pbReset = () => {
    setPb(INITIAL_PB_STATE);
    setMessages([]);
  };

  const pbHandleSend = () => {
    if (!message.trim() || isLoading) return;
    const text = message.trim();
    setMessage('');

    if (pb.step === 'idle') {
      pbAnalyze(text);
    } else if (pb.step === 'asking') {
      pbAnswerQuestion(text);
    }
  };

  const pbCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setPbCopied(key);
    setTimeout(() => setPbCopied(''), 2000);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !activeAgent) return;

    // Route to prompt builder handler if that agent is active
    if (isPromptBuilder) {
      pbHandleSend();
      return;
    }

    const userText = message.trim();
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    // Build conversation history for context
    const history = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const fullPrompt = `${activeAgent.prompt}\n\n${history}\nUser: ${userText}\nAssistant:`;

    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: fullPrompt,
          stream: false,
        }),
      });

      if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
      const data = await res.json();
      const reply = data.response?.trim() || 'No response received.';

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);

      // Increment run count
      setAgents((prev) =>
        prev.map((a) =>
          a.id === activeAgent.id ? { ...a, runs: a.runs + 1, status: 'active' } : a
        )
      );
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ Could not reach Ollama: ${err.message}. Make sure Ollama is running with \`ollama run llama3.2\`.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Try Chrome.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setMessage(transcript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.start();
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.agentsList}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Available Agents</h3>
            <button type="button" className={styles.newAgentBtn}>+ New Agent</button>
          </div>
          <div className={styles.agents}>
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`${styles.agentCard} ${activeAgent?.id === agent.id ? styles.agentCardActive : ''}`}
              >
                <div className={agent.id === VISUAL_PROMPT_BUILDER_ID ? styles.promptAgentIcon : styles.agentIcon}>
                  {agent.id === VISUAL_PROMPT_BUILDER_ID ? '🎨' : '🤖'}
                </div>
                <div className={styles.agentInfo}>
                  <div className={styles.agentName}>{agent.name}</div>
                  <div className={styles.agentDesc}>{agent.description}</div>
                  <div className={styles.agentStats}>
                    <span className={`${styles.statusBadge} ${styles[agent.status]}`}>{agent.status}</span>
                    <span className={styles.runs}>{agent.runs} runs</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.runBtn}
                  onClick={() => openAgent(agent)}
                >
                  {activeAgent?.id === agent.id ? 'Active' : 'Run'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className={`${styles.chatPanel} ${activeAgent ? styles.open : ''}`}>
          {/* Tabs */}
          <div className={styles.panelTabs}>
            <button type="button" className={`${styles.panelTab} ${activeTab === 'chat' ? styles.panelTabActive : ''}`} onClick={() => setActiveTab('chat')}>
              💬 Chat
            </button>
            <button type="button" className={`${styles.panelTab} ${activeTab === 'image' ? styles.panelTabActive : ''}`} onClick={() => setActiveTab('image')}>
              🎨 Image Gen
            </button>
            <button type="button" className={styles.closeChat} onClick={closeChat} aria-label="Close">✕</button>
          </div>

          {/* Chat tab */}
          {activeTab === 'chat' && (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatTitleGroup}>
                  <span className={styles.chatAgentIcon}>{isPromptBuilder ? '🎨' : '🤖'}</span>
                  <h3 className={styles.chatTitle}>{activeAgent?.name ?? 'AI Agent'}</h3>
                </div>
              </div>
              <div className={styles.chatMessages}>
                {/* Visual Prompt Builder: welcome card */}
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
                  // Special rendering for prompt builder result
                  if (msg.text === '__PROMPT_RESULT__' && pb.result) {
                    return (
                      <div key={i} className={styles.promptOutputCard}>
                        <div className={styles.promptSuccessHeader}>✅ ComfyUI Prompts Ready</div>

                        <div className={styles.promptBlock}>
                          <div className={`${styles.promptLabel} ${styles.promptLabelPositive}`}>
                            <span>✦ Positive Prompt</span>
                            <button type="button"
                              className={`${styles.promptCopyBtn} ${pbCopied === 'pos' ? styles.promptCopied : ''}`}
                              onClick={() => pbCopy(pb.result!.positive_prompt, 'pos')}>
                              {pbCopied === 'pos' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                          <pre className={styles.promptText}>{pb.result.positive_prompt}</pre>
                        </div>

                        <div className={styles.promptBlock}>
                          <div className={`${styles.promptLabel} ${styles.promptLabelNegative}`}>
                            <span>✗ Negative Prompt</span>
                            <button type="button"
                              className={`${styles.promptCopyBtn} ${pbCopied === 'neg' ? styles.promptCopied : ''}`}
                              onClick={() => pbCopy(pb.result!.negative_prompt, 'neg')}>
                              {pbCopied === 'neg' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                          <pre className={styles.promptText}>{pb.result.negative_prompt}</pre>
                        </div>

                        <div className={styles.promptActions}>
                          <button type="button" className={styles.promptResetBtn} onClick={pbReset}>
                            🔄 Start Over
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Show current question below the question header message
                  if (isPromptBuilder && pb.step === 'asking' && msg.role === 'assistant' && msg.text.startsWith('**Question')) {
                    const qIdx = pb.questions.findIndex((_, qi) => msg.text.includes(`Question ${qi + 1} of`));
                    const question = qIdx >= 0 ? pb.questions[qIdx] : null;
                    return (
                      <div key={i} className={`${styles.message} ${styles.assistant}`}>
                        <span className={styles.promptStepBadge}>Step 2 · Clarify Details</span>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className={styles.mdP}>{children}</p>,
                            strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                        {question && <p className={styles.promptQuestion}>{question}</p>}
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
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
                          }}
                        >
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
                      : pb.step === 'done' ? 'Prompts generated! Click Start Over for a new one.'
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                )}
                <button type="button" className={styles.sendBtn} onClick={sendMessage} aria-label="Send message" disabled={isLoading || !message.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Image generation tab */}
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

      {!activeAgent && (
        <button type="button" className={styles.openChatBtn} onClick={() => openAgent(agents[0])}>
          ✨ Open AI Chat
        </button>
      )}
    </div>
  );
}
