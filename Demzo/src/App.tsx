import { FormEvent, useEffect, useMemo, useState } from 'react';

type Friend = {
  name: string;
  status: 'online' | 'away' | 'offline';
  preview: string;
};

type Message = {
  id: number;
  sender: 'me' | 'friend';
  body: string;
  time: string;
};

type TrustedNetwork = {
  key: string;
  label: string;
  trustedAt: string;
};

const DEMO_ACCOUNT = {
  email: 'demo@demzo.chat',
  password: 'demzo2026',
  phone: '+1 (555) 014-2026',
  displayName: 'Demzo Demo User',
};

const FRIENDS: Friend[] = [
  { name: 'Ava', status: 'online', preview: 'Typing a voice note...' },
  { name: 'Noah', status: 'away', preview: 'Shared a file 4 min ago' },
  { name: 'Mina', status: 'online', preview: 'Sent an invite to a group chat' },
  { name: 'Jordan', status: 'offline', preview: 'Last seen yesterday' },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'friend', body: 'Welcome to Demzo. Your chats are ready.', time: '09:12' },
  { id: 2, sender: 'me', body: 'I like the security check on new networks.', time: '09:13' },
  { id: 3, sender: 'friend', body: 'That is exactly what this demo is showing.', time: '09:14' },
];

function loadTrustedNetworks(): TrustedNetwork[] {
  try {
    const raw = window.localStorage.getItem('demzo-trusted-networks');
    return raw ? (JSON.parse(raw) as TrustedNetwork[]) : [];
  } catch {
    return [];
  }
}

function saveTrustedNetworks(networks: TrustedNetwork[]) {
  window.localStorage.setItem('demzo-trusted-networks', JSON.stringify(networks));
}

function getDemoNetworkKey() {
  const stored = window.localStorage.getItem('demzo-demo-network');
  if (stored) {
    return stored;
  }

  const randomKey = `198.51.100.${Math.floor(20 + Math.random() * 220)}`;
  window.localStorage.setItem('demzo-demo-network', randomKey);
  return randomKey;
}

function formatTrustedLabel(key: string) {
  return key.replace('198.51.100.', 'Demo IP ');
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function App() {
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState(DEMO_ACCOUNT.password);
  const [messageDraft, setMessageDraft] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'login' | 'verify' | 'chat'>('login');
  const [error, setError] = useState('');
  const [trustedNetworks, setTrustedNetworks] = useState<TrustedNetwork[]>([]);
  const [pendingCode, setPendingCode] = useState('');
  const [pendingNetworkKey, setPendingNetworkKey] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [currentNetworkKey, setCurrentNetworkKey] = useState(getDemoNetworkKey());

  useEffect(() => {
    setTrustedNetworks(loadTrustedNetworks());
  }, []);

  const currentNetwork = useMemo(
    () => ({
      key: currentNetworkKey,
      trusted: trustedNetworks.some((network) => network.key === currentNetworkKey),
    }),
    [currentNetworkKey, trustedNetworks],
  );

  const regenerateNetwork = () => {
    const nextNetwork = `198.51.100.${Math.floor(20 + Math.random() * 220)}`;
    window.localStorage.setItem('demzo-demo-network', nextNetwork);
    setCurrentNetworkKey(nextNetwork);
    setError('');
    setStep('login');
    setVerificationCode('');
    setPendingCode('');
    setPendingNetworkKey('');
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (email !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
      setError('Email or password is incorrect for the demo account.');
      return;
    }

    if (trustedNetworks.some((network) => network.key === currentNetworkKey)) {
      setCurrentUser(DEMO_ACCOUNT.displayName);
      setStep('chat');
      return;
    }

    const code = generateVerificationCode();
    setPendingCode(code);
    setPendingNetworkKey(currentNetworkKey);
    setStep('verify');
  };

  const handleVerify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (verificationCode !== pendingCode) {
      setError('That code does not match. Try the 6-digit code sent to your phone.');
      return;
    }

    const nextTrustedNetworks = [
      ...trustedNetworks,
      {
        key: pendingNetworkKey,
        label: formatTrustedLabel(pendingNetworkKey),
        trustedAt: new Date().toISOString(),
      },
    ];

    setTrustedNetworks(nextTrustedNetworks);
    saveTrustedNetworks(nextTrustedNetworks);
    setCurrentUser(DEMO_ACCOUNT.displayName);
    setStep('chat');
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageDraft.trim()) {
      return;
    }

    const now = new Date();
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        id: previousMessages.length + 1,
        sender: 'me',
        body: messageDraft.trim(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessageDraft('');
  };

  const signOut = () => {
    setCurrentUser(null);
    setStep('login');
    setVerificationCode('');
    setPendingCode('');
    setPendingNetworkKey('');
    setError('');
  };

  return (
    <main className="shell">
      <section className="hero-panel">
        <div className="brand-row">
          <span className="brand-mark">D</span>
          <div>
            <p className="eyebrow">Private messaging</p>
            <h1>Demzo</h1>
          </div>
        </div>
        <p className="hero-copy">
          A modern chat experience with email sign-in and step-up phone verification when a login comes from a new network.
        </p>

        <div className="security-card">
          <p className="security-title">Security posture</p>
          <ul>
            <li>Demo login: {DEMO_ACCOUNT.email}</li>
            <li>Demo password: {DEMO_ACCOUNT.password}</li>
            <li>Verification phone: {DEMO_ACCOUNT.phone}</li>
          </ul>
          <p className="security-note">
            This front-end prototype simulates trusted networks locally. In production, the IP and device trust decision should come from your server before the verification step.
          </p>
        </div>
      </section>

      <section className="surface-panel">
        {step === 'login' && (
          <form className="auth-card" onSubmit={handleLogin}>
            <div className="auth-heading">
              <p className="eyebrow">Sign in</p>
              <h2>Welcome back</h2>
              <p>Use the demo credentials below. A new network will trigger phone verification.</p>
            </div>

            <label>
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
            </label>

            <label>
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
            </label>

            <button className="primary-button" type="submit">
              Continue
            </button>

            <div className="inline-card">
              <div>
                <strong>Current network</strong>
                <p>{currentNetwork.key}</p>
              </div>
              <span className={currentNetwork.trusted ? 'status-pill trusted' : 'status-pill'}>
                {currentNetwork.trusted ? 'Recognized' : 'Needs verification'}
              </span>
            </div>

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        )}

        {step === 'verify' && (
          <form className="auth-card" onSubmit={handleVerify}>
            <div className="auth-heading">
              <p className="eyebrow">Phone verification</p>
              <h2>Check your phone</h2>
              <p>
                We sent a 6-digit code to {DEMO_ACCOUNT.phone}. Enter it here to trust this network and finish signing in.
              </p>
            </div>

            <label>
              <span>Verification code</span>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </label>

            <button className="primary-button" type="submit">
              Verify and continue
            </button>

            <div className="inline-card">
              <div>
                <strong>Demo code</strong>
                <p>{pendingCode}</p>
              </div>
              <span className="status-pill">New network</span>
            </div>

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        )}

        {step === 'chat' && currentUser ? (
          <div className="chat-layout">
            <header className="chat-topbar">
              <div>
                <p className="eyebrow">Signed in as</p>
                <h2>{currentUser}</h2>
              </div>
              <button className="ghost-button" type="button" onClick={signOut}>
                Sign out
              </button>
            </header>

            <div className="chat-grid">
              <aside className="sidebar-card">
                <p className="panel-title">Friends</p>
                {FRIENDS.map((friend) => (
                  <article key={friend.name} className="friend-row">
                    <div>
                      <h3>{friend.name}</h3>
                      <p>{friend.preview}</p>
                    </div>
                    <span className={`status-dot ${friend.status}`} aria-label={friend.status} />
                  </article>
                ))}
              </aside>

              <section className="messages-card">
                <div className="messages-header">
                  <div>
                    <p className="eyebrow">Conversation</p>
                    <h3>Demzo Secure Room</h3>
                  </div>
                  <span className={currentNetwork.trusted ? 'status-pill trusted' : 'status-pill'}>
                    {currentNetwork.trusted ? 'Trusted network' : 'Unverified'}
                  </span>
                </div>

                <div className="message-stream">
                  {messages.map((message) => (
                    <div key={message.id} className={`message-bubble ${message.sender}`}>
                      <p>{message.body}</p>
                      <span>{message.time}</span>
                    </div>
                  ))}
                </div>

                <form className="composer" onSubmit={handleSendMessage}>
                  <input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Send a message to a friend..."
                  />
                  <button className="primary-button" type="submit">
                    Send
                  </button>
                </form>
              </section>

              <aside className="sidebar-card accent-card">
                <p className="panel-title">Trusted network</p>
                <h3>{currentNetwork.key}</h3>
                <p>
                  {currentNetwork.trusted
                    ? 'This network is remembered for faster future sign-ins.'
                    : 'This network still needs verification before it is trusted.'}
                </p>
                <button className="ghost-button" type="button" onClick={regenerateNetwork}>
                  Simulate new network
                </button>
              </aside>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}