import React, { useRef, useEffect } from 'react';
import useStore from '../store/useStore';

const ProjectCard = ({ project }) => {
  const videoRef = useRef(null);
  const setHoveredProject = useStore((state) => state.setHoveredProject);
  const triggerFlare = useStore((state) => state.triggerFlare);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-playing');
          if (videoRef.current) videoRef.current.play().catch(() => {});
        } else {
          entry.target.classList.remove('is-playing');
          if (videoRef.current) videoRef.current.pause();
        }
      });
    }, { threshold: 0.6 });

    const cardFront = document.getElementById(`front-${project.id}`);
    if (cardFront) observer.observe(cardFront);

    return () => {
      if (cardFront) observer.unobserve(cardFront);
    };
  }, [project.id]);

  const handleMouseEnter = () => {
    setHoveredProject(project.id);
  };

  const handleMouseLeave = () => {
    setHoveredProject(null);
  };

  const handleCardClick = (e) => {
    const cardElement = e.currentTarget;
    cardElement.classList.toggle('flipped');
    triggerFlare(); // Trigger the shader flare effect
  };

  return (
    <div 
      className="card" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div className="card-inner">
        <div id={`front-${project.id}`} className="card-front glass">
          <img 
            src={project.video} 
            alt={project.title}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, zIndex: 1, borderRadius: '16px' }}
          />
          <div className="card-front-overlay">
            <h3>MOD // {project.id}</h3>
            <p>{project.title}</p>
          </div>
          <div className="hint">CLICK TO FLIP</div>
        </div>
        <div className="card-back glass">
          <h3>{project.title}</h3>
          <p>{project.desc}<br/><br/>Status: Online</p>
          <a 
            href={project.link} 
            target="_blank" 
            rel="noreferrer" 
            className="btn" 
            onClick={(e) => e.stopPropagation()}
          >
            Initialize Sequence
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;