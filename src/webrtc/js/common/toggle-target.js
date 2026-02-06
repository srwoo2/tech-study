export function createTargetToggleBtn(onTargetChange, initialTarget = '_self') {
  const btn = document.createElement('button');
  btn.id = 'targetToggleBtn';
  btn.textContent = `Target: ${initialTarget}`;
  
  let currentTarget = initialTarget;

  btn.addEventListener('click', () => {
    currentTarget = currentTarget === '_blank' ? '_self' : '_blank';
    btn.textContent = `Target: ${currentTarget}`;

    // 콜백 호출
    if (onTargetChange && typeof onTargetChange === 'function') {
      onTargetChange(currentTarget);
    }
  });

  return btn;
}


