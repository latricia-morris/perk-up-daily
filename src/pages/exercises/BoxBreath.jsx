import ExerciseNav from '@/components/exercises/ExerciseNav';
import BoxBreathExercise from '@/components/exercises/BoxBreathExercise';

export default function BoxBreath() {
  return (
    <div className="relative">
      <ExerciseNav />
      <BoxBreathExercise />
    </div>
  );
}