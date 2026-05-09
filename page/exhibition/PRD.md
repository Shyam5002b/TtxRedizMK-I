# Product Requirements Document (PRD): Autonomous Portfolio

## 1. Executive Summary

The "Autonomous Portfolio" is a highly interactive, 3D web experience designed to replace a static, traditional portfolio site. It transforms the project showcase into a living, immersive "reactor" environment guided by an autonomous, mechanical companion (The Guide). 

The core value proposition is to immediately demonstrate high-level technical proficiency and creative vision in 3D web development, UI/UX design, and interactive storytelling. The MVP goal is to deliver a stable, performant React/Three.js application featuring the dramatic boot sequence, the churning fluid background, the complex robot model, and the glassmorphic project slider.

## 2. Mission

To create a portfolio experience that is as compelling and technically impressive as the work it showcases, blurring the line between utility and digital art.

### Core Principles
- **Atmosphere First:** The environment must feel alive, fluid, and highly reactive to the user.
- **Contrast is Key:** High-contrast elements (stark white LED face, bright neon core vs. dark purple edges) guide the user's eye.
- **Performance matters:** Complex 3D shaders and models must run smoothly (60fps) on modern desktop browsers.
- **Show, Don't Tell:** Technical skill is demonstrated through the experience itself, not just listed on a resume.

## 3. Target Users

- **Recruiters & Hiring Managers:** Looking for standout candidates with proven ability to build complex, polished web experiences. (Medium technical comfort).
- **Potential Clients:** Seeking creative developers for high-end digital campaigns, WebGL experiences, or interactive websites. (Low to Medium technical comfort).
- **Fellow Developers/Designers:** Peers reviewing the work for inspiration or collaboration. (High technical comfort).

**Key User Needs:**
- Needs to quickly understand the developer's skill level.
- Needs an intuitive, memorable way to browse past projects without friction.

## 4. MVP Scope

### In Scope
- ✅ **The Reactor Environment:** A custom WebGL shader background featuring fluid, churning energy (Green/Blue core fading to deep Purple).
- ✅ **Reactive Background:** The shader's animation speed scales with the user's scroll speed and flares on click events.
- ✅ **The Guide (Robot) Responsiveness:** A glossy, pill-shaped 3D model that natively tracks mouse movements in real-time (head and body rotation bounding). It features mechanical detailing and floating, detached limbs.
- ✅ **Dynamic LED Face (Interactive CanvasTexture):** A stark white, 2D `<canvas>` element drawn via JS API, piped in real-time as a `CanvasTexture` to the robot's face material. It displays boot text and actively changes facial expressions (neutral, happy, focused, loading, surprised) based on the user's interaction with the UI.
- ✅ **Dramatic Boot Sequence:** The experience starts pitch black, powers on the Guide's face ("Initialize Protocol" -> "System On"), and then ignites the reactor background and UI.
- ✅ **Glassmorphic UI:** 3D frosted glass project cards that blur the reactor background, arranged in a horizontal slider.
- ✅ **Interaction Logic:** Robot limbs point toward the active project card; cards flip or open links on click.

### Out of Scope
- ❌ Mobile optimization/touch controls (MVP focuses on desktop mouse interactions).
- ❌ Multiple 3D environments or "rooms."
- ❌ Physical physics simulations (e.g., cards bumping into each other).
- ❌ Voice interaction or generative AI chatbot integration.
- ❌ Content Management System (projects are hardcoded in a configuration file for MVP).

## 5. User Stories

- As a **visitor**, I want to **see a dramatic boot sequence when the page loads**, so that **I am immediately immersed in the sci-fi aesthetic.**
- As a **visitor**, I want to **scroll horizontally to view projects**, so that **the background reactor churns faster, making the site feel physically responsive.**
- As a **visitor**, I want the **robot to look at and point to the project I am hovering over**, so that **I feel guided through the experience.**
- As a **visitor**, I want the **project cards to look like frosted glass**, so that **I can still see the beautiful churning reactor behind them without losing readability.**
- As a **visitor**, I want the **reactor to flare up when I click a project**, so that **my interaction feels celebrated and impactful.**

## 6. Core Architecture & Patterns

- **Framework:** React + Vite.
- **3D Engine:** Three.js via React Three Fiber (`@react-three/fiber`) for declarative 3D scene building.
- **Animation/Interaction:** Framer Motion (for UI transitions) and React Spring (`@react-three/spring`) for smooth 3D object interpolation (robot movement, pointing).
- **Shaders:** Custom GLSL shaders for the Reactor background and the Glassmorphism card materials (utilizing `MeshPhysicalMaterial` properties like transmission, roughness, and thickness).

**Key Patterns:**
- **Decoupled Data:** Project details (title, description, link, robot mood) are stored in a standalone `data/projects.js` file to keep the UI components clean.
- **Component Isolation:** The 3D Canvas (`RobotCanvas.jsx`) is completely separated from the HTML overlay UI layer (`ProjectSlider.jsx`, `Header.jsx`), using a state manager (like Zustand or React Context) to sync hover states and scroll positions between the DOM and the WebGL context.

## 7. Tools/Features

- **Shader Background System:** A full-screen quad or large sphere surrounding the scene, utilizing a custom fragment shader to generate Simplex noise. Uniforms will include `uTime`, `uScrollSpeed`, and `uClickFlare` to drive the animation.
- **Three.js Interactive CanvasTexture:** A hidden 2D `<canvas>` element drawn to via standard JS Canvas API, which is passed as a `CanvasTexture` to the robot's face material. `needsUpdate = true` is fired on state changes (hovering cards), allowing for crisp text and real-time expression changes without swapping static image textures.
- **Continuous Mouse Tracking & Bobbing:** Inside the `useFrame` render loop, the robot's `rotation.x` and `rotation.y` are continuously lerped toward the normalized mouse coordinates to create a highly responsive "following" effect, alongside a continuous `Math.sin(time)` bobbing animation.
- **LookAt & Pointing IK:** Logic to calculate the angle between the robot and the currently hovered 3D card coordinate, using `object.lookAt()` and rotating the floating limb meshes to match the vector.

## 8. Technology Stack

- **Core:** React 18, Vite
- **3D Ecosystem:** 
  - `three` (latest)
  - `@react-three/fiber` (React wrapper for Three.js)
  - `@react-three/drei` (Useful helpers, specifically for Environment, HTML overlays, and Textures)
  - `@react-three/spring` (Physics-based animation)
- **Styling:** Tailwind CSS (for the HTML UI overlay layers)
- **State Management:** Zustand (lightweight store for syncing scroll, hover, and boot sequence state between React DOM and R3F Canvas).

## 9. Security & Configuration

- **Configuration:** Project data and core theme colors (Reactor Core, Reactor Edge, Face LED) will be exported as constants from a central configuration file.
- **Security:** Standard static site security. No backend authentication required for the MVP. External links must use `rel="noopener noreferrer"`.
- **Deployment:** Static build (`npm run build`) deployed to Vercel, Netlify, or GitHub Pages.

## 10. API Specification
*(Not applicable for MVP - fully client-side static application)*

## 11. Success Criteria

- ✅ Boot sequence plays flawlessly on initial load (Black -> Face On -> Reactor Ignite).
- ✅ Custom shader background renders at a stable 60fps on standard desktop hardware.
- ✅ Scroll events successfully update the shader's speed uniform.
- ✅ The Robot model renders correctly with floating limbs and glossy materials.
- ✅ The Robot's LED face updates dynamically based on the hovered project card.
- ✅ Glassmorphic cards successfully refract the background shader.

## 12. Implementation Phases

### Phase 1: Foundation & The Reactor (Week 1)
- **Goal:** Set up the R3F environment and create the fluid background shader.
- ✅ Initialize Vite + React + R3F + Tailwind.
- ✅ Write and implement the custom GLSL shader for the Green/Blue/Purple reactor background.
- ✅ Connect scroll events (via Zustand) to the shader's speed uniform.
- **Validation:** A full-screen, smoothly animating fluid background that speeds up when scrolling.

### Phase 2: The Guide & Boot Sequence (Week 2)
- **Goal:** Import the robot model, set up materials, and implement the dramatic boot sequence.
- ✅ Import the complex pill-shaped robot model (GLTF/GLB).
- ✅ Set up the dynamic 2D CanvasTexture for the stark white LED face.
- ✅ Create the boot sequence state machine (Black -> Init -> System On -> Ignite).
- **Validation:** Page loads black, face turns on, text updates, background fades in perfectly timed.

### Phase 3: Glass UI & Interaction Logic (Week 3)
- **Goal:** Build the frosted glass project cards and the robot's pointing/tracking behavior.
- ✅ Implement `MeshPhysicalMaterial` for the project cards to achieve true 3D glassmorphism.
- ✅ Map data from `projects.js` to generate the horizontal slider.
- ✅ Implement the pointing logic for the floating limbs and head tracking.
- ✅ Trigger the reactor "flare" uniform on card click.
- **Validation:** Hovering a card makes the robot point at it and changes its face. Clicking creates a visual background flare.

## 13. Future Considerations

- **Mobile Support:** Refactoring the horizontal scroll into a vertical swipe or gyroscope-based interaction for phones.
- **Generative Audio:** Adding a low, humming ambient soundscape that shifts pitch based on the reactor's churn speed.
- **Model Upgrades:** Adding more complex animations to the floating limbs (idle floating, assembling/disassembling).

## 14. Risks & Mitigations

- **Risk:** Custom shaders and heavy `MeshPhysicalMaterial` (for glass) cause massive frame drops on lower-end devices.
  - **Mitigation:** Implement a performance monitor (`@react-three/drei`'s `PerformanceMonitor`). If FPS drops below 40, automatically fallback to a simpler gradient background and standard transparent materials for the cards.
- **Risk:** Difficulties sourcing or modeling the exact "complex pill-shaped robot with floating limbs."
  - **Mitigation:** Use a placeholder geometric assembly initially while the interaction logic is built, allowing parallel development if 3D modeling takes longer than expected.
- **Risk:** Zustand state updates between the DOM scroll and the WebGL canvas cause stuttering.
  - **Mitigation:** Use `useFrame` directly inside the R3F canvas to read scroll position rather than relying on React state updates for continuous high-frequency values.

## 15. Appendix

- `index_backup.html`: Reference to the original vanilla JS prototype.
- *Placeholder for 3D model asset links.*
- *Placeholder for Shader inspiration links.*