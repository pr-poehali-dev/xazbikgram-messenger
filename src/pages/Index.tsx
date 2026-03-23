import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "chats" | "channels" | "groups" | "favorites" | "settings";
type Modal = "call" | "videocall" | "newGroup" | "newChannel" | "newFolder" | null;
type Theme = "dark-blue" | "dark-purple" | "dark-green" | "midnight" | "carbon";

interface Message {
  id: number;
  text: string;
  time: string;
  out: boolean;
  type: "text" | "voice";
  duration?: string;
  read?: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  type: "chat" | "group" | "channel" | "favorite";
  verified?: boolean;
  messages: Message[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CHATS: Chat[] = [
  {
    id: 1, name: "Алекс Морозов", avatar: "АМ", lastMsg: "Встретимся в 18:00?", time: "18:42",
    unread: 3, online: true, type: "chat", messages: [
      { id: 1, text: "Привет! Как дела?", time: "18:30", out: false, type: "text", read: true },
      { id: 2, text: "Всё отлично, работаю над новым проектом 🚀", time: "18:31", out: true, type: "text", read: true },
      { id: 3, text: "Звучит круто! Что за проект?", time: "18:35", out: false, type: "text" },
      { id: 4, text: "Это секрет пока, но скоро покажу 😄", time: "18:36", out: true, type: "text", read: true },
      { id: 5, text: "Встретимся в 18:00?", time: "18:42", out: false, type: "text" },
    ]
  },
  {
    id: 2, name: "Мария Светлова", avatar: "МС", lastMsg: "Голосовое сообщение", time: "17:15",
    unread: 0, online: true, type: "chat", messages: [
      { id: 1, text: "", time: "17:10", out: false, type: "voice", duration: "0:24" },
      { id: 2, text: "Слышу тебя, всё понятно!", time: "17:12", out: true, type: "text", read: true },
      { id: 3, text: "", time: "17:15", out: false, type: "voice", duration: "0:08" },
    ]
  },
  {
    id: 3, name: "Дизайн Команда", avatar: "ДК", lastMsg: "Обновил макеты в Figma", time: "16:00",
    unread: 12, online: false, type: "group", messages: [
      { id: 1, text: "Всем привет! Новые макеты готовы", time: "15:45", out: false, type: "text" },
      { id: 2, text: "Отлично, посмотрю сегодня вечером", time: "15:50", out: true, type: "text", read: true },
      { id: 3, text: "Обновил макеты в Figma", time: "16:00", out: false, type: "text" },
    ]
  },
  {
    id: 4, name: "Tech Новости", avatar: "ТН", lastMsg: "GPT-5 выйдет в этом квартале", time: "14:30",
    unread: 5, online: false, type: "channel", verified: true, messages: [
      { id: 1, text: "Apple представила новый MacBook Pro с M4 Ultra", time: "13:00", out: false, type: "text" },
      { id: 2, text: "GPT-5 выйдет в этом квартале — инсайд от разработчиков", time: "14:30", out: false, type: "text" },
    ]
  },
  {
    id: 5, name: "Избранное", avatar: "⭐", lastMsg: "Идея для проекта: AI мессенджер", time: "вчера",
    unread: 0, online: false, type: "favorite", messages: [
      { id: 1, text: "Идея для проекта: AI мессенджер с голосовым управлением", time: "вчера", out: true, type: "text", read: true },
      { id: 2, text: "Встреча с инвесторами: пятница 15:00", time: "вчера", out: true, type: "text", read: true },
    ]
  },
  {
    id: 6, name: "Стартап Клуб", avatar: "СК", lastMsg: "Питч в среду!", time: "вчера",
    unread: 2, online: false, type: "group", messages: [
      { id: 1, text: "Ребята, питч в среду в 14:00", time: "вчера", out: false, type: "text" },
      { id: 2, text: "Буду!", time: "вчера", out: true, type: "text", read: true },
    ]
  },
  {
    id: 7, name: "Криптo Инсайды", avatar: "КИ", lastMsg: "Bitcoin пробил $100k", time: "12:00",
    unread: 0, online: false, type: "channel", verified: true, messages: [
      { id: 1, text: "Bitcoin пробил отметку $100,000 — исторический момент!", time: "12:00", out: false, type: "text" },
    ]
  },
];

const THEMES: Record<Theme, { name: string; bg: string; accent: string; sidebar: string }> = {
  "dark-blue":   { name: "Тёмно-синий",      bg: "#080d1a", accent: "#4a9eff", sidebar: "#0c1425" },
  "dark-purple": { name: "Тёмно-фиолетовый", bg: "#0d0a1a", accent: "#9c6fff", sidebar: "#120e25" },
  "dark-green":  { name: "Тёмно-зелёный",    bg: "#080f0d", accent: "#3dba7e", sidebar: "#0c1812" },
  "midnight":    { name: "Полночь",           bg: "#050508", accent: "#6ab4ff", sidebar: "#09090f" },
  "carbon":      { name: "Карбон",            bg: "#0a0a0a", accent: "#ff6b35", sidebar: "#111111" },
};

// ─── Avatar Component ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "linear-gradient(135deg,#4a9eff,#7c5cff)",
  "linear-gradient(135deg,#7c5cff,#ec4899)",
  "linear-gradient(135deg,#10b981,#3dba7e)",
  "linear-gradient(135deg,#f97316,#ef4444)",
  "linear-gradient(135deg,#eab308,#f97316)",
];

const AvatarCircle = ({ text, size = "md", online = false }: { text: string; size?: "sm" | "md" | "lg" | "xl"; online?: boolean }) => {
  const sizes = { sm: "w-9 h-9 text-xs", md: "w-12 h-12 text-sm", lg: "w-16 h-16 text-xl", xl: "w-24 h-24 text-3xl" };
  const dotSizes = { sm: "w-2.5 h-2.5 bottom-[-1px] right-[-1px] border-[1.5px]", md: "w-3 h-3 bottom-0 right-0 border-2", lg: "w-3.5 h-3.5 bottom-0 right-0 border-2", xl: "w-4 h-4 bottom-0.5 right-0.5 border-2" };
  const colorIndex = text.charCodeAt(0) % AVATAR_COLORS.length;
  const isEmoji = text.includes("⭐");

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-bold text-white`}
        style={{ background: AVATAR_COLORS[colorIndex] }}>
        {isEmoji ? "⭐" : text.slice(0, 2)}
      </div>
      {online && (
        <div className={`absolute ${dotSizes[size]} bg-emerald-400 rounded-full border-[var(--xaz-sidebar,#0c1425)]`}
          style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
      )}
    </div>
  );
};

// ─── Toggle Component ──────────────────────────────────────────────────────────
function Toggle({ value, onChange, accent }: { value: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <button onClick={() => onChange(!value)} className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{ background: value ? accent : "rgba(255,255,255,0.1)" }}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? "left-6" : "left-1"}`} />
    </button>
  );
}

function ToggleRow({ label, value, onChange, accent }: { label: string; value: boolean; onChange: (v: boolean) => void; accent: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-white">{label}</span>
      <Toggle value={value} onChange={onChange} accent={accent} />
    </div>
  );
}

function ToggleRowStateful({ label, defaultValue, accent }: { label: string; defaultValue: boolean; accent: string }) {
  const [val, setVal] = useState(defaultValue);
  return <ToggleRow label={label} value={val} onChange={setVal} accent={accent} />;
}

// ─── WaveBars ─────────────────────────────────────────────────────────────────
const WAVE_HEIGHTS = [6, 12, 18, 10, 16, 8, 14, 20, 10, 7, 15, 12, 18, 9, 13, 11];

function WaveBars({ color, playing = false }: { color: string; playing?: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {WAVE_HEIGHTS.map((h, i) => (
        <div key={i} style={{
          width: 3, height: h, borderRadius: 2, background: color, flexShrink: 0,
          animation: playing ? `wave ${0.6 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite` : "none",
          opacity: playing ? 1 : 0.6
        }} />
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Index() {
  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(CHATS[0]);
  const [modal, setModal] = useState<Modal>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(CHATS[0].messages);
  const [theme, setTheme] = useState<Theme>("dark-blue");
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState("Вы");
  const [profileBio, setProfileBio] = useState("Пользователь Xazbikgram Premium ✨");
  const [username, setUsername] = useState("@my_username");
  const [showBio, setShowBio] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [hideAvatar, setHideAvatar] = useState(false);
  const [folders, setFolders] = useState(["Работа", "Личное"]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [callTime, setCallTime] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [sideKey, setSideKey] = useState(0);
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const T = THEMES[theme];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCallActive) interval = setInterval(() => setCallTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const sendMessage = () => {
    if (!message.trim()) return;
    const now = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { id: Date.now(), text: message, time: now, out: true, type: "text", read: false }]);
    setMessage("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, text: "Понял, отвечу чуть позже 👍",
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        out: false, type: "text"
      }]);
    }, 1500);
  };

  const selectChat = (chat: Chat) => {
    setActiveChat(chat);
    setMessages(chat.messages);
    setChatKey(k => k + 1);
    setPlayingVoice(null);
  };

  const startCall = (video: boolean) => {
    setModal(video ? "videocall" : "call");
    setIsCallActive(false);
    setCallTime(0);
    setTimeout(() => setIsCallActive(true), 2500);
  };

  const endCall = () => { setModal(null); setIsCallActive(false); setCallTime(0); };

  const filteredChats = CHATS.filter(c => {
    const bySection =
      section === "chats" ? c.type === "chat" :
      section === "channels" ? c.type === "channel" :
      section === "groups" ? c.type === "group" :
      section === "favorites" ? c.type === "favorite" : false;
    return bySection && c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const navItems = [
    { id: "chats" as Section, icon: "MessageCircle", label: "Чаты" },
    { id: "channels" as Section, icon: "Rss", label: "Каналы" },
    { id: "groups" as Section, icon: "Users", label: "Группы" },
    { id: "favorites" as Section, icon: "Star", label: "Избранное" },
    { id: "settings" as Section, icon: "Settings", label: "Настройки" },
  ];

  const cssVars = {
    "--xaz-bg": T.bg,
    "--xaz-sidebar": T.sidebar,
    "--xaz-blue": T.accent,
    "--xaz-blue-glow": `${T.accent}4d`,
  } as React.CSSProperties;

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans" style={{ ...cssVars, background: T.bg }}>

      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 40% at 20% 30%, ${T.accent}0a 0%, transparent 70%),
                     radial-gradient(ellipse 50% 40% at 80% 70%, #7c5cff0a 0%, transparent 70%),
                     radial-gradient(ellipse 40% 50% at 50% 10%, #f5a6230a 0%, transparent 60%)`
      }} />

      {/* ── Left Navbar ── */}
      <nav className="relative flex flex-col items-center py-5 px-2 gap-1 z-10 flex-shrink-0"
        style={{ width: 72, background: T.sidebar, borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        
        {/* Logo */}
        <button className="mb-5 group" onClick={() => setShowProfile(true)}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-premium group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${T.accent}, #7c5cff)`, boxShadow: `0 0 20px ${T.accent}50` }}>
            <span className="font-display font-black text-white text-base">X</span>
          </div>
        </button>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-1 w-full">
          {navItems.map((item, i) => (
            <button key={item.id}
              onClick={() => { setSection(item.id); setSideKey(k => k + 1); }}
              className={`relative w-full flex flex-col items-center gap-1 py-3 px-1 rounded-xl transition-premium animate-fade-in
                ${section === item.id ? "text-white" : "text-xaz-muted hover:text-white hover:bg-white/5"}`}
              style={{ animationDelay: `${i * 50}ms`,
                background: section === item.id ? `${T.accent}20` : undefined,
                color: section === item.id ? T.accent : undefined }}>
              <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={20} />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
              {section === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r-full"
                  style={{ background: T.accent }} />
              )}
            </button>
          ))}
        </div>

        {/* User avatar */}
        <button onClick={() => setShowProfile(true)} className="mt-2 transition-premium hover:scale-105">
          <AvatarCircle text={profileName.slice(0, 2)} size="sm" online />
        </button>
      </nav>

      {/* ── Chat List Sidebar ── */}
      {section !== "settings" && (
        <aside key={sideKey} className="flex flex-col flex-shrink-0 z-10 animate-fade-in-left"
          style={{ width: 310, background: "rgba(255,255,255,0.015)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

          {/* Sidebar header */}
          <div className="px-4 pt-5 pb-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-display font-bold text-lg text-white">
                {navItems.find(n => n.id === section)?.label}
              </h1>
              <div className="flex gap-0.5">
                {section === "chats" && <>
                  <button onClick={() => setModal("newFolder")} className="btn-icon p-2 rounded-xl text-xaz-muted">
                    <Icon name="FolderPlus" size={16} />
                  </button>
                  <button className="btn-icon p-2 rounded-xl text-xaz-muted">
                    <Icon name="PenSquare" size={16} />
                  </button>
                </>}
                {section === "groups" && (
                  <button onClick={() => setModal("newGroup")} className="btn-icon p-2 rounded-xl text-xaz-muted">
                    <Icon name="Plus" size={16} />
                  </button>
                )}
                {section === "channels" && (
                  <button onClick={() => setModal("newChannel")} className="btn-icon p-2 rounded-xl text-xaz-muted">
                    <Icon name="Plus" size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-xaz-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск..." className="msg-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
            </div>

            {/* Folder chips */}
            {section === "chats" && folders.length > 0 && (
              <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5 no-scrollbar">
                {["Все", ...folders].map(f => {
                  const isActive = f === "Все" ? !activeFolder : activeFolder === f;
                  return (
                    <button key={f} onClick={() => setActiveFolder(f === "Все" ? null : f)}
                      className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-premium whitespace-nowrap"
                      style={{
                        background: isActive ? `${T.accent}25` : "rgba(255,255,255,0.05)",
                        color: isActive ? T.accent : "#6b7a9a",
                        border: isActive ? `1px solid ${T.accent}40` : "1px solid transparent"
                      }}>
                      {f}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat items */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-xaz-muted gap-2 animate-fade-in">
                <Icon name="MessageCircleOff" size={32} className="opacity-20" />
                <p className="text-xs">Пусто</p>
              </div>
            ) : filteredChats.map((chat, i) => (
              <div key={chat.id} onClick={() => selectChat(chat)}
                className={`chat-item flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 animate-fade-in
                  ${activeChat?.id === chat.id ? "active" : ""}`}
                style={{
                  animationDelay: `${i * 40}ms`,
                  ...(activeChat?.id === chat.id ? {
                    background: `${T.accent}12`,
                    borderRight: `2px solid ${T.accent}`
                  } : {})
                }}>
                <AvatarCircle text={chat.avatar} size="md" online={chat.online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-semibold text-sm text-white truncate">{chat.name}</span>
                      {chat.verified && <Icon name="BadgeCheck" size={12} className="flex-shrink-0" style={{ color: T.accent }} />}
                      {chat.type === "channel" && <Icon name="Megaphone" size={10} className="flex-shrink-0 text-xaz-muted" />}
                      {chat.type === "group" && <Icon name="Users" size={10} className="flex-shrink-0 text-xaz-muted" />}
                    </div>
                    <span className="text-[10px] text-xaz-muted flex-shrink-0">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      {chat.messages.at(-1)?.out && (
                        <Icon name="CheckCheck" size={11} className="flex-shrink-0" style={{ color: T.accent }} />
                      )}
                      <span className="text-[11px] text-xaz-muted truncate">{chat.lastMsg}</span>
                    </div>
                    {chat.unread > 0 && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        style={{ background: T.accent }}>
                        {chat.unread > 9 ? "9+" : chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-0">
        {section === "settings" ? (
          <SettingsPanel theme={theme} setTheme={setTheme} T={T}
            profileName={profileName} setProfileName={setProfileName}
            profileBio={profileBio} setProfileBio={setProfileBio}
            username={username} setUsername={setUsername}
            showBio={showBio} setShowBio={setShowBio}
            showPhone={showPhone} setShowPhone={setShowPhone}
            hideAvatar={hideAvatar} setHideAvatar={setHideAvatar}
            folders={folders} setFolders={setFolders} />

        ) : activeChat ? (<>

          {/* Chat Header */}
          <header key={`h-${chatKey}`} className="flex items-center justify-between px-6 py-3.5 flex-shrink-0 animate-fade-in glass"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <AvatarCircle text={activeChat.avatar} size="md" online={activeChat.online} />
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display font-semibold text-white">{activeChat.name}</h2>
                  {activeChat.verified && <Icon name="BadgeCheck" size={14} style={{ color: T.accent }} />}
                </div>
                {activeChat.online
                  ? <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-xs text-emerald-400">онлайн</span></div>
                  : <span className="text-xs text-xaz-muted">был(а) недавно</span>}
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={() => startCall(false)} className="btn-icon p-2.5 rounded-xl text-xaz-muted"><Icon name="Phone" size={18} /></button>
              <button onClick={() => startCall(true)} className="btn-icon p-2.5 rounded-xl text-xaz-muted"><Icon name="Video" size={18} /></button>
              <button className="btn-icon p-2.5 rounded-xl text-xaz-muted"><Icon name="Search" size={18} /></button>
              <button className="btn-icon p-2.5 rounded-xl text-xaz-muted"><Icon name="MoreVertical" size={18} /></button>
            </div>
          </header>

          {/* Messages */}
          <div key={`m-${chatKey}`} className="flex-1 overflow-y-auto px-6 py-5 space-y-2.5">
            {messages.map((msg, i) => (
              <div key={msg.id} className="flex animate-fade-in"
                style={{ animationDelay: `${i * 25}ms`, justifyContent: msg.out ? "flex-end" : "flex-start" }}>
                {!msg.out && (
                  <div className="mr-2 mt-auto flex-shrink-0">
                    <AvatarCircle text={activeChat.avatar} size="sm" />
                  </div>
                )}
                <div className={`max-w-[62%] ${msg.out ? "bubble-out" : "bubble-in"} px-4 py-2.5`}
                  style={msg.out ? { boxShadow: `0 4px 20px ${T.accent}30` } : {}}>
                  {msg.type === "voice" ? (
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <button
                        onClick={() => setPlayingVoice(playingVoice === msg.id ? null : msg.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-premium hover:scale-105"
                        style={{ background: msg.out ? "rgba(255,255,255,0.25)" : `${T.accent}30` }}>
                        <Icon name={playingVoice === msg.id ? "Pause" : "Play"} size={12} className="text-white" style={{ color: msg.out ? "white" : T.accent }} />
                      </button>
                      <WaveBars color={msg.out ? "rgba(255,255,255,0.8)" : T.accent} playing={playingVoice === msg.id} />
                      <span className="text-xs opacity-60 flex-shrink-0">{msg.duration}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-white">{msg.text}</p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] opacity-40">{msg.time}</span>
                    {msg.out && <Icon name={msg.read ? "CheckCheck" : "Check"} size={10} style={{ color: msg.read ? T.accent : "rgba(255,255,255,0.4)" }} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {isRecording && (
              <div className="flex items-center gap-2 px-4 py-2 animate-fade-in">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-red-400">Запись голосового...</span>
                <WaveBars color="#ef4444" playing />
              </div>
            )}
            <div className="flex items-center gap-2 glass rounded-2xl px-3 py-2">
              <button className="btn-icon p-2 rounded-xl text-xaz-muted"><Icon name="Paperclip" size={18} /></button>
              <input value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Написать сообщение..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-xaz-muted outline-none py-1" />
              <button className="btn-icon p-2 rounded-xl text-xaz-muted"><Icon name="Smile" size={18} /></button>
              {message.trim() ? (
                <button onClick={sendMessage}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-premium hover:scale-105 animate-scale-in"
                  style={{ background: `linear-gradient(135deg, ${T.accent}, #7c5cff)`, boxShadow: `0 4px 15px ${T.accent}40` }}>
                  <Icon name="Send" size={15} className="text-white" />
                </button>
              ) : (
                <button onClick={() => setIsRecording(r => !r)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-premium hover:scale-105`}
                  style={isRecording
                    ? { background: "#ef4444", boxShadow: "0 0 20px rgba(239,68,68,0.5)" }
                    : { background: "rgba(255,255,255,0.06)" }}>
                  <Icon name={isRecording ? "Square" : "Mic"} size={16} className={isRecording ? "text-white" : "text-xaz-muted"} />
                </button>
              )}
            </div>
          </div>

        </>) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float"
              style={{ background: `linear-gradient(135deg, ${T.accent}, #7c5cff)`, boxShadow: `0 0 40px ${T.accent}40` }}>
              <span className="font-display font-black text-white text-3xl">X</span>
            </div>
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-white mb-1">Xazbikgram</h2>
              <p className="text-sm text-xaz-muted">Выберите чат для начала общения</p>
            </div>
          </div>
        )}
      </main>

      {/* ─── MODALS ─── */}

      {/* Call / Video Call */}
      {(modal === "call" || modal === "videocall") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px)" }}>
          <div className="glass-strong rounded-3xl p-8 w-80 flex flex-col items-center gap-6 animate-scale-in">
            {modal === "videocall" ? (
              <div className="w-full aspect-video rounded-2xl relative overflow-hidden"
                style={{ background: `linear-gradient(160deg, ${T.bg}, #0a1628)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AvatarCircle text={activeChat?.avatar ?? "?"} size="xl" />
                </div>
                <div className="absolute bottom-3 right-3 w-20 rounded-xl glass aspect-video flex items-center justify-center">
                  <AvatarCircle text={profileName.slice(0, 2)} size="sm" />
                </div>
              </div>
            ) : (
              <div className="relative">
                <AvatarCircle text={activeChat?.avatar ?? "?"} size="xl" />
                {isCallActive && <div className="absolute -inset-3 rounded-full border-2 opacity-30 animate-ping" style={{ borderColor: T.accent }} />}
              </div>
            )}

            <div className="text-center">
              <h3 className="font-display font-bold text-white text-xl">{activeChat?.name}</h3>
              {isCallActive ? (
                <p className="text-xaz-muted text-sm mt-1 tabular-nums">{formatTime(callTime)}</p>
              ) : (
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  <span className="text-xaz-muted text-sm ml-1">Вызов...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full flex items-center justify-center glass transition-premium hover:bg-white/10">
                <Icon name="MicOff" size={20} className="text-white" />
              </button>
              {modal === "videocall" && (
                <button className="w-12 h-12 rounded-full flex items-center justify-center glass transition-premium hover:bg-white/10">
                  <Icon name="VideoOff" size={20} className="text-white" />
                </button>
              )}
              <button onClick={endCall}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-premium hover:scale-105"
                style={{ background: "#ef4444", boxShadow: "0 0 24px rgba(239,68,68,0.5)" }}>
                <Icon name="PhoneOff" size={22} className="text-white" />
              </button>
              <button className="w-12 h-12 rounded-full flex items-center justify-center glass transition-premium hover:bg-white/10">
                <Icon name="Volume2" size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Group */}
      {modal === "newGroup" && (
        <ModalWrap onClose={() => setModal(null)} T={T}>
          <h3 className="font-display font-bold text-white text-lg mb-4">Новая группа</h3>
          <input placeholder="Название группы" className="msg-input w-full px-4 py-3 rounded-xl text-sm mb-3" />
          <textarea placeholder="Описание (необязательно)" className="msg-input w-full px-4 py-3 rounded-xl text-sm h-20 resize-none mb-4" />
          <ModalButtons onClose={() => setModal(null)} T={T} label="Создать" />
        </ModalWrap>
      )}

      {/* New Channel */}
      {modal === "newChannel" && (
        <ModalWrap onClose={() => setModal(null)} T={T}>
          <h3 className="font-display font-bold text-white text-lg mb-4">Новый канал</h3>
          <input placeholder="Название канала" className="msg-input w-full px-4 py-3 rounded-xl text-sm mb-3" />
          <input placeholder="@username_канала" className="msg-input w-full px-4 py-3 rounded-xl text-sm mb-4" />
          <ModalButtons onClose={() => setModal(null)} T={T} label="Создать" />
        </ModalWrap>
      )}

      {/* New Folder */}
      {modal === "newFolder" && (
        <ModalWrap onClose={() => setModal(null)} T={T}>
          <h3 className="font-display font-bold text-white text-lg mb-4">Новая папка</h3>
          <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
            placeholder="Название папки" className="msg-input w-full px-4 py-3 rounded-xl text-sm mb-4"
            onKeyDown={e => { if (e.key === "Enter" && newFolderName.trim()) { setFolders(f => [...f, newFolderName]); setNewFolderName(""); setModal(null); } }} />
          <ModalButtons onClose={() => setModal(null)} T={T} label="Создать"
            onConfirm={() => { if (newFolderName.trim()) { setFolders(f => [...f, newFolderName]); setNewFolderName(""); setModal(null); } }} />
        </ModalWrap>
      )}

      {/* Profile Slide Panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex animate-fade-in"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
          onClick={e => e.target === e.currentTarget && setShowProfile(false)}>
          <div className="w-80 h-full flex flex-col overflow-y-auto animate-fade-in-left"
            style={{ background: T.sidebar, borderRight: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Hero */}
            <div className="relative h-44 flex-shrink-0"
              style={{ background: `linear-gradient(160deg, ${T.accent}35, ${T.bg} 80%)` }}>
              <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 btn-icon p-2 rounded-xl text-white/60">
                <Icon name="X" size={16} />
              </button>
              <div className="absolute -bottom-12 left-6">
                <div className="relative">
                  <AvatarCircle text={profileName.slice(0, 2)} size="xl" online />
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ background: T.accent }}>
                    <Icon name="Camera" size={13} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-16 px-5 pb-6 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-white text-xl">{profileName}</h2>
                  <span className="shimmer text-[10px] font-black tracking-wider">PREMIUM</span>
                </div>
                <p className="text-xaz-muted text-sm">{username}</p>
                {showBio && <p className="text-white/70 text-xs mt-1">{profileBio}</p>}
              </div>

              <div className="flex flex-col gap-3 glass rounded-2xl p-4">
                <div>
                  <label className="text-[10px] text-xaz-muted uppercase tracking-wider mb-1.5 block">Имя</label>
                  <input value={profileName} onChange={e => setProfileName(e.target.value)} className="msg-input w-full px-3 py-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-xaz-muted uppercase tracking-wider mb-1.5 block">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} className="msg-input w-full px-3 py-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-xaz-muted uppercase tracking-wider mb-1.5 block">О себе</label>
                  <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} className="msg-input w-full px-3 py-2.5 rounded-xl text-sm h-16 resize-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1 glass rounded-2xl p-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <p className="text-[10px] text-xaz-muted uppercase tracking-wider mb-2">Приватность</p>
                <ToggleRow label="Показывать описание" value={showBio} onChange={setShowBio} accent={T.accent} />
                <ToggleRow label="Показывать номер телефона" value={showPhone} onChange={setShowPhone} accent={T.accent} />
                <ToggleRow label="Скрыть аватар от незнакомцев" value={hideAvatar} onChange={setHideAvatar} accent={T.accent} />
              </div>

              <button onClick={() => setShowProfile(false)}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-premium hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.accent}, #7c5cff)`, boxShadow: `0 4px 20px ${T.accent}35` }}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal Wrapper ─────────────────────────────────────────────────────────────
function ModalWrap({ children, onClose, T }: { children: React.ReactNode; onClose: () => void; T: { accent: string; bg: string } }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(20px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-strong rounded-3xl p-6 w-96 animate-scale-in">{children}</div>
    </div>
  );
}

function ModalButtons({ onClose, T, label, onConfirm }: { onClose: () => void; T: { accent: string }; label: string; onConfirm?: () => void }) {
  return (
    <div className="flex gap-3">
      <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xaz-muted text-sm glass transition-premium hover:bg-white/5">Отмена</button>
      <button onClick={onConfirm ?? onClose}
        className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-premium hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${T.accent}, #7c5cff)` }}>{label}</button>
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────────
type ThemeShape = { name: string; bg: string; accent: string; sidebar: string };
function SettingsPanel({ theme, setTheme, T, profileName, setProfileName, profileBio, setProfileBio,
  username, setUsername, showBio, setShowBio, showPhone, setShowPhone, hideAvatar, setHideAvatar, folders, setFolders }: {
  theme: Theme; setTheme: (t: Theme) => void; T: ThemeShape;
  profileName: string; setProfileName: (v: string) => void;
  profileBio: string; setProfileBio: (v: string) => void;
  username: string; setUsername: (v: string) => void;
  showBio: boolean; setShowBio: (v: boolean) => void;
  showPhone: boolean; setShowPhone: (v: boolean) => void;
  hideAvatar: boolean; setHideAvatar: (v: boolean) => void;
  folders: string[]; setFolders: (fn: (prev: string[]) => string[]) => void;
}) {

  const [active, setActive] = useState("profile");

  const sections = [
    { key: "profile", icon: "User", label: "Профиль" },
    { key: "theme", icon: "Palette", label: "Оформление" },
    { key: "notifications", icon: "Bell", label: "Уведомления" },
    { key: "privacy", icon: "Lock", label: "Конфиденциальность" },
    { key: "folders", icon: "FolderOpen", label: "Папки" },
    { key: "security", icon: "Shield", label: "Безопасность" },
  ];

  return (
    <div className="flex flex-1 overflow-hidden animate-fade-in">
      {/* Settings nav */}
      <div className="w-60 flex-shrink-0 py-6 px-3 flex flex-col gap-1"
        style={{ background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <h2 className="font-display font-bold text-white text-lg px-3 mb-3">Настройки</h2>
        {sections.map((s, i) => (
          <button key={s.key} onClick={() => setActive(s.key)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-premium text-left animate-fade-in"
            style={{
              animationDelay: `${i * 40}ms`,
              background: active === s.key ? `${T.accent}18` : undefined,
              color: active === s.key ? T.accent : "#6b7a9a"
            }}>
            <Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
            <span className={active === s.key ? "text-white" : ""}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">

        {active === "profile" && (
          <div className="max-w-md animate-fade-in">
            <h3 className="font-display font-bold text-white text-xl mb-6">Профиль</h3>
            <div className="flex items-center gap-5 mb-7">
              <div className="relative">
                <AvatarCircle text={profileName.slice(0, 2)} size="xl" online />
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: T.accent }}>
                  <Icon name="Camera" size={13} className="text-white" />
                </button>
              </div>
              <div>
                <p className="font-display font-bold text-white text-lg">{profileName}</p>
                <p className="text-xaz-muted text-sm">{username}</p>
                <span className="shimmer text-[10px] font-black">PREMIUM</span>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 flex flex-col gap-4">
              {[
                { label: "Имя", value: profileName, onChange: setProfileName, multiline: false },
                { label: "Username", value: username, onChange: setUsername, multiline: false },
                { label: "О себе", value: profileBio, onChange: setProfileBio, multiline: true },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] text-xaz-muted uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  {f.multiline
                    ? <textarea value={f.value} onChange={e => f.onChange(e.target.value)} className="msg-input w-full px-4 py-3 rounded-xl text-sm h-20 resize-none" />
                    : <input value={f.value} onChange={e => f.onChange(e.target.value)} className="msg-input w-full px-4 py-3 rounded-xl text-sm" />
                  }
                </div>
              ))}
              <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <ToggleRow label="Показывать описание" value={showBio} onChange={setShowBio} accent={T.accent} />
                <ToggleRow label="Показывать номер телефона" value={showPhone} onChange={setShowPhone} accent={T.accent} />
                <ToggleRow label="Скрыть аватар от незнакомцев" value={hideAvatar} onChange={setHideAvatar} accent={T.accent} />
              </div>
            </div>
          </div>
        )}

        {active === "theme" && (
          <div className="max-w-lg animate-fade-in">
            <h3 className="font-display font-bold text-white text-xl mb-6">Оформление мессенджера</h3>
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(THEMES) as [Theme, (typeof THEMES)[Theme]][]).map(([key, t]) => (
                <button key={key} onClick={() => setTheme(key)}
                  className="relative p-5 rounded-2xl transition-premium text-left overflow-hidden"
                  style={{
                    background: t.bg,
                    border: `2px solid ${theme === key ? t.accent : "rgba(255,255,255,0.08)"}`,
                    boxShadow: theme === key ? `0 0 25px ${t.accent}35` : "none"
                  }}>
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-full" style={{ background: t.accent }} />
                    <div className="w-3 h-3 rounded-full self-center opacity-40" style={{ background: t.accent }} />
                  </div>
                  <p className="text-white text-sm font-semibold font-display">{t.name}</p>
                  <div className="flex gap-1 mt-2">
                    <div className="h-1 rounded-full flex-1 opacity-30" style={{ background: t.accent }} />
                    <div className="h-1 rounded-full w-8" style={{ background: t.accent }} />
                  </div>
                  {theme === key && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: t.accent }}>
                      <Icon name="Check" size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {active === "notifications" && (
          <div className="max-w-md animate-fade-in">
            <h3 className="font-display font-bold text-white text-xl mb-6">Уведомления</h3>
            <div className="glass rounded-2xl p-5 flex flex-col gap-1">
              {[
                ["Звук новых сообщений", true],
                ["Вибрация", true],
                ["Превью в уведомлениях", false],
                ["Уведомления от групп", true],
                ["Уведомления от каналов", true],
                ["Показывать счётчик на иконке", true],
              ].map(([label, def]) => (
                <ToggleRowStateful key={label as string} label={label as string} defaultValue={def as boolean} accent={T.accent} />
              ))}
            </div>
          </div>
        )}

        {active === "privacy" && (
          <div className="max-w-md animate-fade-in">
            <h3 className="font-display font-bold text-white text-xl mb-6">Конфиденциальность</h3>
            <div className="glass rounded-2xl p-5 flex flex-col gap-1">
              <ToggleRow label="Кто видит мой номер телефона" value={showPhone} onChange={setShowPhone} accent={T.accent} />
              <ToggleRow label="Скрыть аватар от незнакомцев" value={hideAvatar} onChange={setHideAvatar} accent={T.accent} />
              <ToggleRowStateful label="Двухфакторная аутентификация" defaultValue={false} accent={T.accent} />
              <ToggleRowStateful label="Скрывать статус «онлайн»" defaultValue={false} accent={T.accent} />
            </div>
          </div>
        )}

        {active === "folders" && (
          <div className="max-w-md animate-fade-in">
            <h3 className="font-display font-bold text-white text-xl mb-6">Папки с чатами</h3>
            <div className="flex flex-col gap-2 mb-4">
              {folders.map((f: string, i: number) => (
                <div key={f} className="glass rounded-xl px-4 py-3 flex items-center justify-between animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <Icon name="Folder" size={15} style={{ color: T.accent }} />
                    <span className="text-white text-sm">{f}</span>
                  </div>
                  <button onClick={() => setFolders((prev: string[]) => prev.filter((_: string, j: number) => j !== i))}
                    className="btn-icon p-1.5 rounded-lg text-xaz-muted hover:text-red-400">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
              {folders.length === 0 && <p className="text-xaz-muted text-sm text-center py-4">Папок пока нет</p>}
            </div>
            <div className="flex gap-3">
              <input id="folder-input" placeholder="Название папки" className="msg-input flex-1 px-4 py-2.5 rounded-xl text-sm"
                onKeyDown={e => {
                  const inp = e.target as HTMLInputElement;
                  if (e.key === "Enter" && inp.value.trim()) { setFolders((f: string[]) => [...f, inp.value]); inp.value = ""; }
                }} />
              <button onClick={() => {
                const inp = document.getElementById("folder-input") as HTMLInputElement;
                if (inp?.value.trim()) { setFolders((f: string[]) => [...f, inp.value]); inp.value = ""; }
              }} className="px-4 py-2.5 rounded-xl text-white font-semibold text-sm transition-premium hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${T.accent}, #7c5cff)` }}>
                Добавить
              </button>
            </div>
          </div>
        )}

        {active === "security" && (
          <div className="max-w-md animate-fade-in flex flex-col items-center justify-center h-60 gap-3 text-xaz-muted">
            <Icon name="Shield" size={48} className="opacity-20" />
            <p className="text-sm">Раздел в разработке</p>
          </div>
        )}
      </div>
    </div>
  );
}