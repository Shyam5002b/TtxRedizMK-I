import React, { useState, useEffect, useRef } from 'react';
import ProjectCard from './ProjectCard';
import { projectData } from '../data/projects';
import useStore from '../store/useStore';

const ProjectSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const trackRef = useRef(null);

  const SLIDE_DURATION = 10000;
  const CARD_WIDTH = 320;
  const CARD_GAP = 32;
  const SET_SIZE = projectData.length;

  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId;

    const updateTimer = (currentTime) => {
      let deltaTime = currentTime - lastTime;
      if (deltaTime > 1000) deltaTime = 1000;
      lastTime = currentTime;

      if (!isHovering) {
        setTimeElapsed(prev => {
          const newTime = prev + deltaTime;
          if (newTime >= SLIDE_DURATION) {
            slideToNext();
            return 0;
          }
          return newTime;
        });
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovering]);

  const slideToNext = () => {
    const cardsVisible = Math.max(1, Math.floor(window.innerWidth / (CARD_WIDTH + CARD_GAP)));
    setCurrentIndex(prev => {
      let nextIndex = prev + cardsVisible;
      
      if (nextIndex >= SET_SIZE) {
        // Handle wrap around smoothly by resetting after transition
        setTimeout(() => {
          if (trackRef.current) {
            trackRef.current.style.transition = 'none';
            setCurrentIndex(nextIndex % SET_SIZE);
          }
        }, 1200);
      }
      return nextIndex;
    });
  };

  const progressPercent = (timeElapsed / SLIDE_DURATION) * 100;

  // Duplicate array for infinite scroll illusion
  const extendedData = [...projectData, ...projectData];

  return (
    <>
      <div 
        className="slider-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="track-container">
          <div 
            className="track" 
            ref={trackRef}
            style={{ 
              transform: `translateX(-${currentIndex * (CARD_WIDTH + CARD_GAP)}px)`,
              transition: currentIndex >= SET_SIZE ? 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)' : (trackRef.current?.style.transition === 'none' ? 'none' : 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)')
            }}
          >
            {extendedData.map((project, idx) => (
              <ProjectCard 
                key={`${project.id}-${idx}`} 
                project={project} 
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="progress-wrapper">
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default ProjectSlider;