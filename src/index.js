import { WebRTCPage } from './pages/WebRTCPage';
import { Header } from './layout/Header';
import './webrtc/js/common/ga';

window.addEventListener('DOMContentLoaded', () => {
  console.log('0.0.0.7');
  
  // Inject global styles
  if (!document.getElementById('global-styles')) {
    const link1 = document.createElement('link');
    link1.id = 'global-styles';
    link1.rel = 'stylesheet';
    link1.href = '/src/webrtc/css/main.css';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = '/src/webrtc/css/toggle-target.css';
    document.head.appendChild(link2);
  }

  // render
  const app = document.getElementById('app');

  function renderLanding() {
    app.innerHTML = '';

    // Render Header
    const header = new Header({  title: 'Frontend Study Portal',  showBackBtn: false });
    app.appendChild(header.render());

    // Render Content
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.textAlign = 'center';
    
    // Use standard link to /webrtc/
    container.innerHTML = `<a id="webrtc-link" class="btn-primary">WebRTC Samples</a>`;
    app.appendChild(container);

    document.getElementById('webrtc-link').addEventListener('click', () => {
      window.history.pushState({}, '', '/webrtc');
      
      app.innerHTML = '';
      const page = new WebRTCPage();
      page.render();
    });
  }

  // Initial Routing Check
  if (window.location.pathname === '/webrtc') {
    const page = new WebRTCPage();
    page.render();
  } else {
    renderLanding();
  }
});
