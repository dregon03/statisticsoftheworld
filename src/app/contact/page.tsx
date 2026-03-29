'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'sent' : 'error');
      if (res.ok) setForm({ name: '', email: '', subject: 'general', message: '' });
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#1a1a2e]">
      <Nav />

      <section className="max-w-[560px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-bold mb-1">Contact Us</h1>
        <p className="text-[15px] text-[#64748b] mb-8">Questions about the API, partnerships, or data requests? We'd love to hear from you.</p>

        {status === 'sent' ? (
          <div className="bg-white border border-green-200 rounded-xl p-8 text-center">
            <div className="text-[32px] mb-2">&#10003;</div>
            <h2 className="text-[18px] font-semibold mb-2">Message sent</h2>
            <p className="text-[15px] text-[#64748b]">We'll get back to you within 24 hours.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-[14px] text-[#0066cc] hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <div>
              <label className="text-[14px] font-medium text-[#0d1b2a] block mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] bg-[#f8f9fb] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
              />
            </div>

            <div>
              <label className="text-[14px] font-medium text-[#0d1b2a] block mb-1.5">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] bg-[#f8f9fb] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
              />
            </div>

            <div>
              <label className="text-[14px] font-medium text-[#0d1b2a] block mb-1.5">Subject</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] bg-[#f8f9fb] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc]"
              >
                <option value="general">General Inquiry</option>
                <option value="api">API Support</option>
                <option value="billing">Billing</option>
                <option value="partnership">Partnership</option>
                <option value="data">Data Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label className="text-[14px] font-medium text-[#0d1b2a] block mb-1.5">Message <span className="text-red-400">*</span></label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help?"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] bg-[#f8f9fb] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 focus:border-[#0066cc] resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-[14px] text-red-500">Failed to send. Please email us directly at statisticsoftheworldcontact@gmail.com</p>
            )}

            <button
              type="submit"
              disabled={status === 'sending' || !form.email || !form.message}
              className="w-full py-2.5 bg-[#0d1b2a] text-white rounded-lg text-[14px] font-medium hover:bg-[#1a2d4a] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-[14px] text-[#64748b]">
          Or email us directly at{' '}
          <a href="mailto:statisticsoftheworldcontact@gmail.com" className="text-[#0066cc] hover:underline">
            statisticsoftheworldcontact@gmail.com
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
