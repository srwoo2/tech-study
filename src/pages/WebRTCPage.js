import { routeConfig } from '../route';
import { Header } from '../layout/Header';
import { createTargetToggleBtn } from '../webrtc/js/common/toggle-target.js';

export class WebRTCPage {
    constructor() {
    }
  
    render() {
       this._renderListView();
    }

    _renderListView() {
      const app = document.getElementById('app');
      app.innerHTML = '';
  
      // Header
      const headerComp = new Header({
        title: 'WebRTC Samples',
        showBackBtn: false
      });
      app.appendChild(headerComp.render());

      // Content
      const container = document.createElement('div');
      container.id = 'container';
  
      const introSection = document.createElement('section');
      introSection.innerHTML = `
        <p>
            이는 <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API">WebRTC API</a>의 다양한 부분을 시연하는
            여러 작은 예제들의 모음입니다. 모든 예제의 코드는
            <a href="https://github.com/webrtc/samples">GitHub 저장소</a>에서 확인할 수 있습니다.
        </p>
        <p>
            대부분의 예제는 사양 변경이나 브라우저별 프리픽스 차이를 보완하기 위한 작은 라이브러리(shim)인
            <a href="https://github.com/webrtc/adapter">adapter.js</a>를 사용합니다.
        </p>
        <p>
            <a href="https://webrtc.org/getting-started/testing" title="Command-line flags for WebRTC testing">
                https://webrtc.org/getting-started/testing
            </a>
            에서는 Chrome에서 개발 및 테스트할 때 유용한 커맨드라인 플래그 목록을 확인할 수 있습니다.
        </p>
        <p>
            패치나 이슈 제보는 언제든 환영합니다! 자세한 내용은
            <a href="https://github.com/webrtc/samples/blob/gh-pages/CONTRIBUTING.md">CONTRIBUTING.md</a>
            를 참고하세요.
        </p>
        <p class="warning">
            <strong>경고:</strong> 테스트 중에는 반드시 헤드폰 사용을 권장합니다.
            그렇지 않으면 시스템에서 큰 오디오 피드백이 발생할 수 있습니다.
        </p>
      `;
      container.appendChild(introSection);
  
      const samplesSection = document.createElement('section');
      routeConfig.forEach(section => {
        const h2 = document.createElement('h2');
        h2.textContent = section.title;
        samplesSection.appendChild(h2);
  
        const ul = document.createElement('ul');
        section.items.forEach(item => {
           const li = document.createElement('li');
           const a = document.createElement('a');
           a.textContent = item.text;
           a.href = item.href; 
           li.appendChild(a);
           ul.appendChild(li);
        });
        samplesSection.appendChild(ul);
      });
      container.appendChild(samplesSection);

      const targetToggleBtn = createTargetToggleBtn((target) => {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
          link.target = target;
        });
      });
      container.appendChild(targetToggleBtn);
  
      // 최종 렌더링
      app.appendChild(container);
    }

    unmount() {
    }
}
