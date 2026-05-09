import { create } from 'zustand';

const useStore = create((set) => ({
  // Boot Sequence State
  // 'black' -> 'init' -> 'system_on' -> 'ignite'
  bootState: 'black',
  setBootState: (state) => set({ bootState: state }),

  // Scroll state to drive the shader
  scrollSpeed: 0,
  setScrollSpeed: (speed) => set({ scrollSpeed: speed }),

  // Interaction State
  hoveredProject: null,
  setHoveredProject: (id) => set({ hoveredProject: id }),

  // Reactor Flare
  flareTrigger: 0,
  triggerFlare: () => set((state) => ({ flareTrigger: state.flareTrigger + 1 })),
}));

export default useStore;
