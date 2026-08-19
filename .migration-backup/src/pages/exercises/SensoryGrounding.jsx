import { useNavigate } from 'react-router-dom';
import ExerciseShell from '@/components/exercises/ExerciseShell';
import Grounding54321 from '@/components/exercises/Grounding54321';

export default function SensoryGrounding() {
  const navigate = useNavigate();
  return (
    <ExerciseShell>
      <div className="min-h-screen w-full flex flex-col items-center justify-center px-5 pt-16 pb-32"
        style={{ background: '#fbf6ef', fontFamily: "'DM Sans', sans-serif", color: '#2F2C29' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-8 text-center" style={{ color: '#219EBC' }}>
          5-4-3-2-1 Grounding
        </p>
        <Grounding54321
          accentColor="#219EBC"
          onComplete={() => navigate('/neural-training')}
        />
      </div>
    </ExerciseShell>
  );
}