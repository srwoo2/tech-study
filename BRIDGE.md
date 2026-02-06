# Native <-> Web Bridge Spec

이 문서는 네이티브 앱(Android/iOS)과 웹 간의 통신을 위한 브릿지 인터페이스를 설명합니다.

## 앱 -> 웹 (Native to Web)

앱에서 웹의 기능을 제어하기 위해 자바스크립트 함수 `window.handleCallEvent(type)`를 호출합니다.

### 함수 시그니처
```javascript
window.handleCallEvent(type: string)
```

### 파라미터 `type`

| 타입 (type) | 설명 | 동작 |
| :--- | :--- | :--- |
| `'start'` | 통화 시작 | 웹의 `startCall()` 함수를 실행합니다. (UI의 '통화 시작' 버튼과 동일) |
| `'accept'` | 전화 받기 | 웹의 `receiveCall()` 함수를 실행합니다. (UI의 '전화 받기' 버튼과 동일) |
| `'end'` | 통화 종료 | 웹의 `endCall()` 함수를 실행합니다. (UI의 '통화 종료' 버튼과 동일) |
| `'video'` | 카메라 토글 | 웹의 `callManager.toggleMedia('video')`를 실행합니다. (카메라 On/Off 제어) |
| `'audio'` | 마이크 토글 | 웹의 `callManager.toggleMedia('audio')`를 실행합니다. (마이크 Mute/Unmute 제어) |

### 호출 예시

**Android**
```java
// 통화 시작
webView.evaluateJavascript("window.handleCallEvent('start')", null);

// 카메라 토글
webView.evaluateJavascript("window.handleCallEvent('video')", null);
```

**iOS (Swift)**
```swift
// 전화 받기
webView.evaluateJavaScript("window.handleCallEvent('accept')", completionHandler: nil)

// 마이크 토글
webView.evaluateJavaScript("window.handleCallEvent('audio')", completionHandler: nil)
```

---

## 웹 -> 앱 (Web to Native)

웹에서 앱의 기능을 호출할 때 사용하는 인터페이스입니다. 현재는 웹뷰 닫기 기능이 정의되어 있습니다.

### `window.closeHandler()`

통화 종료 후 '닫기' 버튼 등을 눌렀을 때 호출됩니다.

- **Android**: `window.Android.closeHandler()` 호출
- **iOS**: `window.webkit.messageHandlers.closeHandler.postMessage({ action: 'close' })` 호출
