export default function LessonList({ lessons, activeId, unlockedLessonIds, masteryByLesson, onSelect }) {
  const unlocked = unlockedLessonIds ?? new Set(lessons.map((l) => l.id));
  return (
    <div className="lesson-list">
      <div className="lesson-list-header">Python Lessons ({lessons?.length ?? 0})</div>
      <div className="lesson-list-note">Complete each lesson (Mastery Check ✓) to unlock the next.</div>
      {(lessons ?? []).map((l, index) => {
        const isUnlocked = unlocked.has(l.id);
        const prevLesson = index > 0 ? lessons[index - 1] : null;
        return (
          <button
            key={l.id}
            type="button"
            className={`lesson-item ${l.id === activeId ? "active" : ""} ${!isUnlocked ? "locked" : ""}`}
            onClick={() => isUnlocked && onSelect?.(l.id)}
            disabled={!isUnlocked}
            title={!isUnlocked && prevLesson ? `Complete "${prevLesson.title}" to unlock` : undefined}
          >
            {!isUnlocked && <span className="lesson-lock" aria-hidden>🔒</span>}
            <div className="lesson-title">{l.title}</div>
            <div className="lesson-obj">
              {!isUnlocked && prevLesson
                ? `Complete Lesson ${index} to unlock`
                : l.objective}
            </div>
            {masteryByLesson?.[l.id] && <span className="lesson-mastered">✓</span>}
          </button>
        );
      })}
    </div>
  );
}