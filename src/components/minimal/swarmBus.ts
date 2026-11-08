/**
 * Tiny shared state between the swarm build and the guided tour.
 * Window events: 'swarm:start', 'swarm:ready' (first screen built or skipped),
 * 'swarm:end' (finished, skipped or cancelled), 'tour:state' (detail: { running }).
 */
type Waiter = { el: Element; done: () => void };

let waiters: Waiter[] = [];

export const swarmBus = {
  running: false,
  ready: false,
  /** the visitor scrolled during the build: the tour then starts without scrolling the page for them */
  userScrolled: false,
  /** set by the swarm: is this element (or anything inside / around it) still unbuilt? */
  isPending: (() => false) as (el: Element) => boolean,

  /** resolves once the swarm has built `el` (right away if no swarm is running) */
  whenBuilt(el: Element): Promise<void> {
    if (!swarmBus.running || !swarmBus.isPending(el)) return Promise.resolve();
    return new Promise((done) => waiters.push({ el, done }));
  },

  /** the swarm calls this after each finished piece */
  notify() {
    waiters = waiters.filter((w) => {
      if (swarmBus.running && swarmBus.isPending(w.el)) return true;
      w.done();
      return false;
    });
  },
};
