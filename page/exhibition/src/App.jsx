import React, { useEffect } from 'react';
import Header from './components/Header';
import RobotCanvas from './components/RobotCanvas';
import ProjectSlider from './components/ProjectSlider';
import useStore from './store/useStore';
import './styles/App.css';

function App() {
  const setScrollSpeed = useStore((state) => state.setScrollSpeed);
  const setBootState = useStore((state) => state.setBootState);

  useEffect(() => {
    // Phase 1: Simulate the boot sequence
    const t1 = setTimeout(() => setBootState('init'), 1000);
    const t2 = setTimeout(() => setBootState('system_on'), 2500);
    const t3 = setTimeout(() => setBootState('ignite'), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [setBootState]);

  useEffect(() => {
    let scrollTimeout;
    
    const handleWheel = (e) => {
      // Normalize delta to a reasonable speed value (-1 to 1)
      const speed = Math.min(Math.max(e.deltaY * 0.01, -1), 1);
      setScrollSpeed(speed);
      
      // Reset speed to 0 after scrolling stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollSpeed(0);
      }, 150);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [setScrollSpeed]);

  return (
    <>
      <RobotCanvas />
      
      <div className="ui-layer" style={{ pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <Header />
        </div>
        
        <div className="hero-text">
          <h1>Active Modules</h1>
          <p>Continuous integration. Click to flip telemetry.</p>
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          <ProjectSlider />
        </div>
      </div>
    </>
  );
}

export default App;