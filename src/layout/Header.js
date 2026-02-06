export class Header {
  constructor({ title = 'WebRTC Samples', showBackBtn = true, backPath = '/', onBack = null } = {}) {
    Object.assign(this, { title, showBackBtn, backPath, onBack });
  }

  render() {
    const header = document.createElement('header');
    header.className = 'main-header';
    header.innerHTML = `
      <div class="header-left">
        ${this.showBackBtn ? '<button class="header-back-btn">←</button>' : ''}
        <h1 class="header-title">${this.title}</h1>
      </div>
      <div class="header-right">
        ${window.location.pathname !== '/' ? '<a href="/" class="header-home-link">Home</a>' : ''}
      </div>
    `;

    if (this.showBackBtn) {
      header.querySelector('.header-back-btn').onclick = () => {
        if (this.onBack) return this.onBack();
        window.history.length > 1 ? window.history.back() : (window.location.href = this.backPath);
      };
    }
    return header;
  }
}

// Auto-injection for standalone pages
(function() {
  const init = () => {
    if (document.querySelector('.main-header') || document.getElementById('app')) return;
    document.body.prepend(new Header({ title: document.title || 'WebRTC Sample' }).render());
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
