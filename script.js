const flame = document.getElementById('flame');
const smokeContainer = document.getElementById('smoke-container');
const message = document.getElementById('message');

let blowCount = 0;        // счетчик дуновений
let candleBlown = false;  // флаг, что свеча задета
const threshold = 20;     // порог громкости

async function initMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mic = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    const dataArray = new Uint8Array(analyser.fftSize);

    mic.connect(analyser);

    function createSmoke() {
      const smoke = document.createElement('div');
      smoke.className = 'smoke';
      smoke.style.left = `${Math.random() * 30}px`; // случайная позиция по горизонтали
      smokeContainer.appendChild(smoke);

      smoke.addEventListener('animationend', () => smoke.remove());
    }

    function checkVolume() {
      analyser.getByteTimeDomainData(dataArray);

      const avg = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0) / dataArray.length;

      if (!candleBlown && avg > threshold) {
        blowCount++;

        if (blowCount === 1) {
          message.textContent = 'Попробуй еще раз!';
        } else if (blowCount >= 2) {
          flame.style.display = 'none'; // пламя потухло навсегда
          candleBlown = true;
          message.textContent = 'ПОЗДРАВЛЯЮ ТЕБЯ С ДНЕМ РОЖДЕНИЯ!!';
        }
      }

      // Если свеча задета, создаем дымку каждый кадр
      if (candleBlown) {
        createSmoke();
      }

      requestAnimationFrame(checkVolume);
    }

    checkVolume();
  } catch (err) {
    message.textContent = 'Разреши доступ к микрофону';
    console.error(err);
  }
}

initMic();
