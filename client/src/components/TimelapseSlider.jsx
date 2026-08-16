import { useState, useEffect, useRef } from 'react';

function TimelapseSlider({ allFires, onFilteredFires, onExit }) {
  const [dates, setDates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const uniqueDates = [...new Set(allFires.map((f) => f.acquiredDate))]
      .filter(Boolean)
      .sort();
    setDates(uniqueDates);
    setCurrentIndex(uniqueDates.length - 1);
  }, [allFires]);

  useEffect(() => {
    if (dates.length === 0) return;
    const currentDate = dates[currentIndex];
    const filtered = allFires.filter((f) => f.acquiredDate === currentDate);
    onFilteredFires(filtered, currentDate);
  }, [currentIndex, dates]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % dates.length);
      }, 1500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, dates.length]);

  if (dates.length === 0) return null;

  return (
    <div className="timelapse-panel">
      <div className="timelapse-header">
        <span className="timelapse-title">⏱ TIME-LAPSE — {dates[currentIndex]}</span>
        <button className="timelapse-exit" onClick={onExit}>✕ Exit</button>
      </div>

      <div className="timelapse-controls">
        <button className="timelapse-play" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min="0"
          max={dates.length - 1}
          value={currentIndex}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentIndex(Number(e.target.value));
          }}
          className="timelapse-slider"
        />
        <span className="timelapse-count">{currentIndex + 1} / {dates.length}</span>
      </div>
    </div>
  );
}

export default TimelapseSlider;