/**
 * CallManager handles WebRTC PeerConnection and MediaStream logic.
 */
class CallManager {
  constructor(config, onStateChange, onIceCandidate) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.onIceCandidate = onIceCandidate;
    
    this.pc = null;
    this.localStream = null;
    this.remoteStream = new MediaStream();
    this._state = window.CALL_STATUS.WAITING.id;
    this.timeoutId = null;
    this.pendingCandidates = []; // Buffering candidates until remoteDescription is set
  }

  get state() {
    return this._state;
  }

  set state(val) {
    const oldState = this._state;
    this._state = val;

    // 연결중(CONNECTING)이 아닌 모든 상태로 전환 시 타임아웃 해제
    if (val !== window.CALL_STATUS.CONNECTING.id) {
      this.stopTimeout();
    }

    if (this.onStateChange) this.onStateChange(val);
  }

  /**
   * 미디어 장치 권한 체크 및 스트림 획득
   */
  async getMediaStream(localVideoElement) {
    // 0. 기존 스트림 유효성 체크 (iOS 백그라운드 복귀 시 스트림이 죽어있을 수 있음)
    if (this.localStream) {
      const hasLiveTracks = this.localStream.getTracks().some(t => t.readyState === 'live');
      if (hasLiveTracks) {
        return this.localStream;
      } else {
        console.log('[CallManager] Stream is inactive (likely due to backgrounding). Re-acquiring...');
        this.stopMedia();
      }
    }

    try {
      // 0. 보안 컨텍스트 확인 (HTTPS 혹은 localhost 필수)
      if (!window.isSecureContext) {
        throw new Error(window.ERRORS.MEDIA_SECURE_CONTEXT);
      }

      // 1. 사전 체크: 장치 존재 여부 확인
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(d => d.kind === 'videoinput');
      const hasAudio = devices.some(d => d.kind === 'audioinput');

      if (!hasVideo) throw new Error(window.ERRORS.MEDIA_NO_CAMERA);
      if (!hasAudio) throw new Error(window.ERRORS.MEDIA_NO_MIC);

      // 2. 스트림 획득 시도
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true
      });
      this.localStream = stream;

      if (localVideoElement) {
        // 로컬 화면용으로 비디오 트랙만 따로 뽑은 새로운 스트림 적용 (현상 방지)
        const videoOnlyStream = new MediaStream(stream.getVideoTracks());
        localVideoElement.srcObject = videoOnlyStream;
      }
      return stream;
    } catch (e) {
      console.error('Media Access Error:', e);
      
      // Native Error Mapping
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        throw new Error(window.ERRORS.MEDIA_PERMISSION); // 권한 거부
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        throw new Error(window.ERRORS.MEDIA_NO_CAMERA); // 장치 없음
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        throw new Error(window.ERRORS.MEDIA_IN_USE);
      }
      
      throw e; // 이미 매핑된 window.ERRORS 혹은 기타 에러 그대로 상위 전달
    }
  }

  /**
   * PeerConnection 생성 및 설정
   */
  ensurePC(remoteVideoElement) {
    if (this.pc) return this.pc;
    
    this.pc = new RTCPeerConnection(this.config.iceServers);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => this.pc.addTrack(track, this.localStream));
    }

    if (remoteVideoElement) {
      remoteVideoElement.srcObject = this.remoteStream;
    }

    this.pc.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (stream) {
        stream.getTracks().forEach((t) => this.remoteStream.addTrack(t));
      } else {
        this.remoteStream.addTrack(event.track);
      }
    };

    this.pc.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidate) {
        this.onIceCandidate(event.candidate);
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log('ICE state:', this.pc.iceConnectionState);
      switch (this.pc.iceConnectionState) {
        case 'checking':
          this.state = CALL_STATUS.CONNECTING.id;
          break;
        case 'connected':
        case 'completed':
          this.state = CALL_STATUS.CONNECTED.id;
          break;
        case 'failed':
          this.state = CALL_STATUS.ERROR.id;
          break;
        case 'disconnected':
        case 'closed':
          this.closePC();
          this.state = CALL_STATUS.DISCONNECTED.id;
          break;
      }
    };

    return this.pc;
  }

  async createOffer() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async handleOffer(offer) {
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this.processPendingCandidates(); // Flush queue
    return answer;
  }

  async handleAnswer(answer) {
    if (this.pc && this.pc.signalingState === 'have-local-offer') {
      await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
      await this.processPendingCandidates(); // Flush queue
    }
  }

  async processPendingCandidates() {
    if (!this.pc || !this.pc.remoteDescription) return;
    
    console.log(`[CallManager] Processing ${this.pendingCandidates.length} pending ICE candidates.`);
    while (this.pendingCandidates.length > 0) {
      const candidate = this.pendingCandidates.shift();
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('[CallManager] Error adding queued ICE candidate:', e);
      }
    }
  }

  async addIceCandidate(candidate) {
    if (!this.pc || !candidate) return;

    // remoteDescription이 아직 설정되지 않았다면 큐에 보관 (InvalidStateError 방지)
    if (!this.pc.remoteDescription) {
      console.log('[CallManager] Remote description null. Queuing ICE candidate.');
      this.pendingCandidates.push(candidate);
      return;
    }

    try {
      // sdpMid나 sdpMLineIndex가 둘 다 null이면 유효하지 않은 후보이므로 무시 (Chrome 등에서 발생 가능)
      if (candidate.candidate && (candidate.sdpMid !== null || candidate.sdpMLineIndex !== null)) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        console.warn('[CallManager] Skipping malformed or empty ICE candidate:', candidate);
      }
    } catch (e) {
      console.error('[CallManager] Error adding ICE candidate:', e);
    }
  }

  closePC() {
    this.stopTimeout();
    this.pendingCandidates = []; // Clear queue
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }

  stopMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  /**
   * 미디어 장치 제어
   * @param {string} type 'video' | 'audio'
   */
  toggleMedia(type) {
    if (!this.localStream) return;

    const isVideo = type === 'video';
    const tracks = isVideo ? this.localStream.getVideoTracks() : this.localStream.getAudioTracks();
    const track = tracks[0];

    if (track) {
      // 카메라 Off: "검은 화면(Black Frames)"을 전송
      // 마이크 Off: "무음(Silence)"을 전송
      track.enabled = !track.enabled; // WebRTC 자체 기능으로 처리 
      
      // UI 업데이트
      const btnId = isVideo ? 'toggleCameraBtn' : 'toggleAudioBtn';
      const btn = document.getElementById(btnId);
      if (btn) {
        const label = isVideo ? '카메라' : '마이크';
        btn.textContent = `${label} ${track.enabled ? 'On' : 'Off'}`;
      }
      return track.enabled;
    }
    return false;
  }

  /**
   * 연결 타임아웃 시작
   * @param {number} ms 타임아웃 시간
   * @param {function} onTimeout 타임아웃 시 콜백
   * @param {function} onCountdown 카운트다운 콜백 (1초마다 실행)
   */
  startTimeout(ms, onTimeout, onCountdown) {
    this.stopTimeout();
    
    let remaining = Math.ceil(ms / 1000);
    if (onCountdown) onCountdown(remaining);

    this.countdownInterval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0 && onCountdown) {
        onCountdown(remaining);
      }
      if (remaining <= 0) {
        // 타이머 표시 종료 - 하지만 실제 타임아웃은 setTimeout이 책임짐
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    }, 1000);

    this.timeoutId = setTimeout(() => {
      this.stopTimeout();
      if (onTimeout) onTimeout();
    }, ms);
  }

  /**
   * 연결 타임아웃 중지
   */
  stopTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}

window.CallManager = CallManager;
