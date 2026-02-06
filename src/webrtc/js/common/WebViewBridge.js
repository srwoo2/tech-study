/**
 * =================================================================================
 * WebView Bridge (Native <-> Web)
 * =================================================================================
 * 
 * [1] Native -> Web Communication (Inbound)
 * 앱에서 웹페이지의 기능을 제어하고 싶을 때 아래 메서드를 호출합니다.
 * 
 *   - Android: webView.evaluateJavascript("window.handleCallEvent('start')", null);
 *   - iOS:     webView.evaluateJavaScript("window.handleCallEvent('start')")
 * 
 * [2] Web -> Native Communication (Outbound)
 * 웹에서 앱의 기능을 호출할 때 사용하는 인터페이스입니다.
 * 
 *   - Android: JavascriptInterface 연동 (브릿지 명칭: Android)
 *   - iOS:     WKScriptMessageHandler 연동 (메시지 명칭: closeHandler)
 * 
 * =================================================================================
 */

/**
 * 네이티브 웹뷰 브릿지
 * 웹 → 앱으로 웹뷰 종료 신호 전송
 * (사용 예: 통화 종료 후 창 닫기 버튼 클릭 시)
 */
window.closeHandler = function() {
  console.log('[Bridge] Web -> Native: closeHandler called');

  // Android: window.Android.closeHandler() 가 정의되어 있어야 함
  if (window.Android && window.Android.closeHandler) {
    window.Android.closeHandler();
    return;
  }

  // iOS: window.webkit.messageHandlers.closeHandler 가 정의되어 있어야 함
  if (window.webkit?.messageHandlers?.closeHandler) {
    window.webkit.messageHandlers.closeHandler.postMessage({ action: 'close' });
    return;
  }

  // 브라우저 환경 (Fallback)
  console.log('[Bridge] Fallback: redirecting to about:blank');
  window.location.href = 'about:blank';
  window.close();
};

/**
 * 네이티브 웹뷰 브릿지
 * 앱 → 웹으로 통화 신호 전송
 * (사용 예: 앱의 상단바 버튼이나 푸시 알림 등을 통해 액션 발생 시)
 * 
 * @param {string} type - 'start' | 'accept' | 'end'
 */
window.handleCallEvent = function(type) {
  console.log('[Bridge] Native -> Web: handleCallEvent received:', type);

  switch (type) {
    case 'start':
      console.log("[Bridge] Triggering: startCall()");
      if (typeof window.startCall === 'function') {
        window.startCall(); // '통화 시작' 버튼 클릭과 동일한 동작
      } else {
        console.warn('[Bridge] startCall function not found');
      }
      break;

    case 'accept':
      console.log("[Bridge] Triggering: receiveCall()");
      if (typeof window.receiveCall === 'function') {
        window.receiveCall(); // '전화 받기' 버튼 클릭과 동일한 동작
      } else {
        console.warn('[Bridge] receiveCall function not found');
      }
      break;

    case 'end':
      console.log("[Bridge] Triggering: endCall()");
      if (typeof window.endCall === 'function') {
        window.endCall(); // '통화 종료' 버튼 클릭과 동일한 동작
      } else {
        console.warn('[Bridge] endCall function not found');
      }
      break;

    case 'video':
      console.log("[Bridge] Triggering: toggleMedia('video')");
      if (window.callManager && typeof window.callManager.toggleMedia === 'function') {
        window.callManager.toggleMedia('video');
      } else {
        console.warn('[Bridge] callManager.toggleMedia function not found');
      }
      break;

    case 'audio':
      console.log("[Bridge] Triggering: toggleMedia('audio')");
      if (window.callManager && typeof window.callManager.toggleMedia === 'function') {
        window.callManager.toggleMedia('audio');
      } else {
        console.warn('[Bridge] callManager.toggleMedia function not found');
      }
      break;

    default:
      console.warn('[Bridge] Unknown event type:', type);
  }
};
