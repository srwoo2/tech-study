(function() {
  if (document.querySelector('.main-header')) return; // Prevent duplicate injection

  const header = document.createElement('header');
  header.className = 'main-header';

  // Left Section
  const leftSection = document.createElement('div');
  leftSection.className = 'header-left';

  // Back Button
  const backBtn = document.createElement('button');
  backBtn.className = 'header-back-btn';
  backBtn.textContent = '←';
  backBtn.addEventListener('click', () => {
     if (window.history.length > 1) {
         window.history.back();
     } else {
         window.location.href = '/';
     }
  });
  leftSection.appendChild(backBtn);

  // Title
  const titleEl = document.createElement('h1');
  titleEl.className = 'header-title';
  titleEl.textContent = document.title || 'WebRTC Sample';
  leftSection.appendChild(titleEl);

  header.appendChild(leftSection);

  // Right Section (Home)
  const rightSection = document.createElement('div');
  rightSection.className = 'header-right';

  if (window.location.pathname !== '/') {
      const homeLink = document.createElement('a');
      homeLink.href = '/';
      homeLink.textContent = 'Home';
      homeLink.className = 'header-home-link';
      rightSection.appendChild(homeLink);
  }

  header.appendChild(rightSection);

  // Prepend to body
  document.body.insertBefore(header, document.body.firstChild);
})();
