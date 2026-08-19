import ExerciseNav from '@/components/exercises/ExerciseNav';
import FocusExercise from '@/components/exercises/FocusExercise';

export default function Focus() {
  return (
    <div className="relative">
      <ExerciseNav />
      <FocusExercise />
    </div>
  );
}