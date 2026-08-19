import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="min-h-screen" style={{ background: '#fef9f2' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="flex items-center gap-2 text-sm mb-8" style={{ color: '#7a5c3a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <h1 className="font-display text-3xl font-semibold mb-2" style={{ color: '#2c1e0f' }}>
          A Note Before You Get Started
        </h1>
        <div className="mt-8 space-y-5 text-sm leading-relaxed" style={{ color: '#4a3520' }}>
          <p>
            Perk Up Daily is a wellness and encouragement app. It is not therapy. We are not doctors, licensed therapists, psychologists, psychiatrists, or mental health professionals, and nothing in this app should be understood as medical or mental health advice.
          </p>
          <p>
            The content in this app, including affirmations, scripture, prompts, and curated encouragement, is intended for general wellness and personal enrichment purposes only. It is not intended to diagnose, treat, cure, or prevent any mental health condition, emotional disorder, or medical disease of any kind.
          </p>
          <p>
            If you are experiencing a mental health crisis, symptoms of depression, anxiety, or any other condition that affects your ability to function, please seek the guidance of a qualified mental health or medical professional. Do not delay or disregard professional advice because of anything you read or receive in this app.
          </p>
          <p>
            The science referenced in this app reflects published research on neuroplasticity and positive psychology. Individual results vary, and Perk Up Daily makes no guarantee of specific outcomes.
          </p>
          <p>
            Testimonials and user experiences shared in this app or on our website reflect individual results only. Your experience may differ.
          </p>
          <p>
            By using Perk Up Daily you acknowledge that you are doing so voluntarily and at your own discretion, and that Perk Up Daily, its founder, team, and affiliates are not liable for any outcome resulting from your use of the app.
          </p>
          <div className="rounded-xl p-5 mt-6" style={{ background: '#fff3db', border: '1px solid #f5d680' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: '#2c1e0f' }}>If you are in crisis or need immediate help</p>
            <p style={{ color: '#4a3520' }}>
              Please contact the 988 Suicide and Crisis Lifeline by calling or texting <strong>988</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}