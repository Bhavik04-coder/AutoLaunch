'use client';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './media.module.scss';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: string;
  date: string;
  preview?: string;
}

const MOCK_MEDIA: MediaItem[] = [
  { id: '1', name: 'Centralize_Every_Interaction.png', type: 'image', size: '2.4 MB', date: '2026-03-10', preview: '/Centralize_Every_Interaction_version_1 (1) (1).png' },
  { id: '2', name: 'From_Concept_to_Code-Ready_v1.png', type: 'image', size: '1.8 MB', date: '2026-03-10', preview: '/From_Concept_to_Code-Ready_version_1 (1) (1).png' },
  { id: '3', name: 'From_Concept_to_Code-Ready_v2.png', type: 'image', size: '1.6 MB', date: '2026-03-10', preview: '/From_Concept_to_Code-Ready_version_1 (2).png' },
  { id: '4', name: 'Sustain_your_ecosystem.png', type: 'image', size: '2.1 MB', date: '2026-03-10', preview: '/Sustain_your_ecosystem__version_1 (1) (1).png' },
  { id: '5', name: 'large.png', type: 'image', size: '3.2 MB', date: '2026-03-08', preview: '/large.png' },
  { id: '6', name: 'April_Hackathon.mp4', type: 'video', size: '24.5 MB', date: '2026-03-01', preview: '/Your_April_Hackathon_Starts_Now_version_1 (1).mp4' },
  { id: '7', name: 'motion2Fast_dashboard.mp4', type: 'video', size: '48.2 MB', date: '2026-02-28', preview: '/motion2Fast_Animate_this_modern_SaaS_dashboard_UI_where_a_user_0.mp4' },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const OLLAMA_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';

function ImageGenModal({
  prompt,
  onClose,
  onGenerated,
}: {
  prompt: string;
  onClose: () => void;
  onGenerated: (item: MediaItem) => void;
}) {
  const [editedPrompt, setEditedPrompt] = useState(prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setPreviewUrl('');
    try {
      const res = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llava',
          prompt: `Generate an image based on this description: ${editedPrompt}`,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`Model returned ${res.status}`);
      const data = await res.json();
      // Ollama image models return base64 in images array
      const b64 = data.images?.[0] || data.response;
      if (!b64) throw new Error('No image returned');
      const url = `data:image/png;base64,${b64}`;
      setPreviewUrl(url);
    } catch (err: any) {
      setError(`${err.message}. Make sure Ollama is running with an image model.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!previewUrl) return;
    onGenerated({
      id: `gen-${Date.now()}`,
      name: `ai-generated-${Date.now()}.png`,
      type: 'image',
      size: 'AI Generated',
      date: new Date().toISOString().split('T')[0],
      preview: previewUrl,
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>🎨 Generate Image from Prompt</span>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.promptLabel}>Prompt</label>
          <textarea
            className={styles.promptInput}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            rows={4}
          />
          {error && <div className={styles.genError}>{error}</div>}
          {previewUrl && (
            <div className={styles.previewWrap}>
              <img src={previewUrl} alt="Generated" className={styles.generatedImg} />
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          {previewUrl && (
            <button className={styles.saveBtn} onClick={handleSave}>Save to Library</button>
          )}
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={isGenerating || !editedPrompt.trim()}
          >
            {isGenerating ? '⏳ Generating...' : '✨ Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MediaComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [toast, setToast] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [showImageGen, setShowImageGen] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prompt = searchParams.get('imagePrompt');
    if (prompt) {
      setImagePrompt(decodeURIComponent(prompt));
      setShowImageGen(true);
      // Clean the URL without reload
      router.replace('/media');
    }
  }, [searchParams, router]);

  const filtered = media.filter((m) => filter === 'all' || m.type === filter);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems: MediaItem[] = files.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      size: formatBytes(f.size),
      date: new Date().toISOString().split('T')[0],
      preview: f.type.startsWith('image') ? URL.createObjectURL(f) : undefined,
    }));
    setMedia((prev) => [...newItems, ...prev]);
    setToast(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`);
    setTimeout(() => setToast(''), 3000);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Lightbox Preview */}
      {previewItem && (
        <div className={styles.lightboxOverlay} onClick={() => setPreviewItem(null)}>
          <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxHeader}>
              <span className={styles.lightboxName}>{previewItem.name}</span>
              <div className={styles.lightboxActions}>
                {previewItem.preview && (
                  <a href={previewItem.preview} download={previewItem.name} className={styles.downloadBtn}>
                    ↓ Download
                  </a>
                )}
                <button className={styles.lightboxClose} onClick={() => setPreviewItem(null)} aria-label="Close">✕</button>
              </div>
            </div>
            <div className={styles.lightboxBody}>
              {previewItem.preview ? (
                previewItem.type === 'video' ? (
                  <video src={previewItem.preview} controls autoPlay className={styles.lightboxMedia} />
                ) : (
                  <img src={previewItem.preview} alt={previewItem.name} className={styles.lightboxMedia} />
                )
              ) : (
                <div className={styles.lightboxNoPreview}>No preview available</div>
              )}
            </div>
            <div className={styles.lightboxFooter}>
              <span>{previewItem.size}</span>
              <span>{previewItem.date}</span>
              <span className={styles.typeBadge} data-type={previewItem.type}>{previewItem.type}</span>
            </div>
          </div>
        </div>
      )}
      {showImageGen && (
        <ImageGenModal
          prompt={imagePrompt}
          onClose={() => setShowImageGen(false)}
          onGenerated={(item) => {
            setMedia((prev) => [item, ...prev]);
            setShowImageGen(false);
            setToast('Image generated and added to media library');
            setTimeout(() => setToast(''), 3000);
          }}
        />
      )}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {(['all', 'image', 'video'] as const).map((f) => (
            <button key={f} type="button" className={filter === f ? styles.active : ''} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className={styles.filterCount}>
                {f === 'all' ? media.length : media.filter((m) => m.type === f).length}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <div className={styles.viewToggle}>
            <button type="button" aria-label="Grid view" className={view === 'grid' ? styles.active : ''} onClick={() => setView('grid')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            <button type="button" aria-label="List view" className={view === 'list' ? styles.active : ''} onClick={() => setView('list')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className={styles.hiddenInput}
                onChange={handleUpload}
                aria-label="Upload media files"
                title="Upload media files"
              />
          <button type="button" className={styles.uploadBtn} onClick={() => inputRef.current?.click()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🖼️</div>
            <p>No {filter === 'all' ? '' : filter} files yet</p>
            <button type="button" className={styles.uploadBtn} onClick={() => inputRef.current?.click()}>Upload files</button>
          </div>
        ) : view === 'grid' ? (
          <div className={styles.grid}>
            {filtered.map((item) => (
              <div key={item.id} className={styles.gridItem}>
                <div className={styles.thumbnail} onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
                  {item.preview ? (
                    item.type === 'video' ? (
                      <video src={item.preview} className={styles.previewImg} muted playsInline />
                    ) : (
                      <img src={item.preview} alt={item.name} className={styles.previewImg} />
                    )
                  ) : item.type === 'video' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M15 10L19.5528 7.72361C20.2177 7.39116 21 7.87465 21 8.61803V15.382C21 16.1253 20.2177 16.6088 19.5528 16.2764L15 14M5 18H13C14.1046 18 15 17.1046 15 16V8C15 6.89543 14.1046 6 13 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M4 16L8.58579 11.4142C9.36683 10.6332 10.6332 10.6332 11.4142 11.4142L16 16M14 14L15.5858 12.4142C16.3668 11.6332 17.6332 11.6332 18.4142 12.4142L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(item.id)} aria-label="Delete">✕</button>
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName} title={item.name}>{item.name}</div>
                  <div className={styles.itemMeta}>{item.size} · {item.date}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
                  <td>{item.name}</td>
                  <td><span className={styles.typeBadge} data-type={item.type}>{item.type}</span></td>
                  <td>{item.size}</td>
                  <td>{item.date}</td>
                  <td>
                    <button type="button" className={styles.rowDeleteBtn} onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
