export class Header {
  constructor(options = {}) {
    this.title = options.title || 'WebRTC Samples';
    this.showBackBtn = options.showBackBtn ?? true;
    this.backPath = options.backPath || '/';
    this.onBack = options.onBack || null;
  }

  render() {
    const header = document.createElement('header');
    header.className = 'main-header';

    const leftSection = document.createElement('div');
    leftSection.className = 'header-left';

    if (this.showBackBtn) {
      const backBtn = document.createElement('button');
      backBtn.className = 'header-back-btn';
      backBtn.textContent = '←';
      backBtn.addEventListener('click', () => {
        if (this.onBack) {
          this.onBack();
        } else {
          // Default behavior: Go back in history if possible, or fallback to backPath
          if (window.history.length > 1) {
             window.history.back();
          } else {
             window.location.href = this.backPath;
          }
        }
      });
      leftSection.appendChild(backBtn);
    }

    const titleEl = document.createElement('h1');
    titleEl.className = 'header-title';
    titleEl.textContent = this.title;
    leftSection.appendChild(titleEl);

    header.appendChild(leftSection);

    // Optional right section (for Home)
    const rightSection = document.createElement('div');
    rightSection.className = 'header-right';
    
    if (window.location.pathname !== '/') {
        const homeLink = document.createElement('a');
        homeLink.href = '/';
        homeLink.textContent = 'Home';
        homeLink.className = 'header-home-link';
        // Standard link behavior
        rightSection.appendChild(homeLink);
    }

    header.appendChild(rightSection);

    return header;
  }
}
