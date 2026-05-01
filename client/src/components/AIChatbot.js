import React, { useState } from 'react';

const QUICK_QUESTIONS = [
  'How do I place an order?',
  'How long is delivery?',
  'How do I pay?',
  'How can I track my order?',
];

function getBotReply(text) {
  const q = text.toLowerCase();
  if (q.includes('order')) return 'Browse products, add to cart, then checkout. Upload payment screenshot to confirm the order.';
  if (q.includes('deliver') || q.includes('shipping')) return 'Digital items are processed quickly. Fashion items are delivered to your provided address.';
  if (q.includes('pay') || q.includes('payment')) return 'At checkout, scan the QR code and upload your payment screenshot. eSewa integration is coming soon.';
  if (q.includes('track') || q.includes('status')) return 'Open your profile and go to Orders to see current status updates from admin.';
  if (q.includes('refund')) return 'Please contact support with your order ID and payment details for refund assistance.';
  return 'I can help with orders, payment, delivery, tracking, and account support. Ask me anything about Shield store.';
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am Shield AI assistant. How can I help you today?' },
  ]);

  const sendMessage = (text) => {
    const content = text.trim();
    if (!content || isTyping) return;
    const reply = getBotReply(content);
    setMessages((prev) => [...prev, { from: 'user', text: content }]);
    setInput('');
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
      {open ? (
        <div className="w-80 max-w-[85vw] rounded-2xl border border-surface-700 bg-surface-800 shadow-card-hover overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-700 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-100">Shield AI Assistant</p>
            <button type="button" onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-200">×</button>
          </div>
          <div className="p-3 max-h-72 overflow-auto space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm px-3 py-2 rounded-xl ${m.from === 'bot' ? 'bg-surface-700 text-neutral-200 mr-6' : 'bg-accent text-black ml-6'}`}>
                {m.text}
              </div>
            ))}
            {isTyping ? (
              <div className="text-sm px-3 py-2 rounded-xl bg-surface-700 text-neutral-300 mr-6">
                Shield AI is typing...
              </div>
            ) : null}
          </div>
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} type="button" onClick={() => sendMessage(q)} className="text-xs px-2 py-1 rounded-lg border border-surface-600 text-neutral-300 hover:border-accent hover:text-accent transition-colors">
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t border-surface-700 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 text-sm"
            />
            <button type="submit" className="px-3 py-2 rounded-xl bg-accent text-black font-semibold text-sm">
              Send
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-12 px-4 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-500 transition-colors"
      >
        AI Chat
      </button>
    </div>
  );
}
