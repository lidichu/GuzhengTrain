// 配置常量
const CONFIG = {
    tolerance: 2, // 音高允許誤差範圍（音分）
    smoothingTimeConstant: 0.8,
    fftSize: 2048,
    updateInterval: 50, // 更新頻率（毫秒）
    referenceA4: 440 // 標準音A4頻率
};

// 調音模式定義
const TUNING_MODES = {
    D: {
        name: 'D調',
        strings: [
            { number: 1, note: 'D6', freq: 1174.66 },
            { number: 2, note: 'B5', freq: 987.77 },
            { number: 3, note: 'A5', freq: 880.00 },
            { number: 4, note: 'G5', freq: 783.99 },
            { number: 5, note: 'E5', freq: 659.26 },
            { number: 6, note: 'D5', freq: 587.33 },
            { number: 7, note: 'B4', freq: 493.88 },
            { number: 8, note: 'A4', freq: 440.00 },
            { number: 9, note: 'G4', freq: 392.00 },
            { number: 10, note: 'E4', freq: 329.63 },
            { number: 11, note: 'D4', freq: 293.66 },
            { number: 12, note: 'B3', freq: 246.94 },
            { number: 13, note: 'A3', freq: 220.00 },
            { number: 14, note: 'G3', freq: 196.00 },
            { number: 15, note: 'E3', freq: 164.81 },
            { number: 16, note: 'D3', freq: 146.83 },
            { number: 17, note: 'B2', freq: 123.47 },
            { number: 18, note: 'A2', freq: 110.00 },
            { number: 19, note: 'G2', freq: 98.00 },
            { number: 20, note: 'E2', freq: 82.41 },
            { number: 21, note: 'D2', freq: 73.42 }
        ]
    },
    G: {
        name: 'G調',
        strings: [
            { number: 1, note: 'G6', freq: 1567.98 },
            { number: 2, note: 'E6', freq: 1318.51 },
            { number: 3, note: 'D6', freq: 1174.66 },
            { number: 4, note: 'C6', freq: 1046.50 },
            { number: 5, note: 'A5', freq: 880.00 },
            { number: 6, note: 'G5', freq: 783.99 },
            { number: 7, note: 'E5', freq: 659.26 },
            { number: 8, note: 'D5', freq: 587.33 },
            { number: 9, note: 'C5', freq: 523.25 },
            { number: 10, note: 'A4', freq: 440.00 },
            { number: 11, note: 'G4', freq: 392.00 },
            { number: 12, note: 'E4', freq: 329.63 },
            { number: 13, note: 'D4', freq: 293.66 },
            { number: 14, note: 'C4', freq: 261.63 },
            { number: 15, note: 'A3', freq: 220.00 },
            { number: 16, note: 'G3', freq: 196.00 },
            { number: 17, note: 'E3', freq: 164.81 },
            { number: 18, note: 'D3', freq: 146.83 },
            { number: 19, note: 'C3', freq: 130.81 },
            { number: 20, note: 'A2', freq: 110.00 },
            { number: 21, note: 'G2', freq: 98.00 }
        ]
    }
};

class Tuner {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.mediaStream = null;
        this.currentMode = 'D';
        this.isListening = false;
        this.currentString = null;
        
        // DOM 元素
        this.elements = {
            startButton: document.getElementById('startButton'),
            playReference: document.getElementById('playReference'),
            currentString: document.querySelector('.current-string'),
            currentFrequency: document.querySelector('.current-frequency'),
            targetFrequency: document.querySelector('.target-frequency'),
            statusMessage: document.querySelector('.status-message'),
            centsDisplay: document.querySelector('.cents-display'),
            indicatorNeedle: document.querySelector('.indicator-needle'),
            stringsDisplay: document.querySelector('.strings-display'),
            modeButtons: document.querySelectorAll('.mode-button'),
            modal: document.getElementById('micPermissionModal'),
            modalCloseBtn: document.querySelector('.modal-close-btn'),
            volumeBarsContainer: document.querySelector('.volume-bars-container')
        };

        this.volumeMeter = new VolumeMeter(this.elements.volumeBarsContainer);
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 模式切換按鈕
        this.elements.modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.setMode(button.dataset.mode);
            });
        });

        // 開始調音按鈕
        this.elements.startButton.addEventListener('click', () => {
            if (!this.isListening) {
                this.startTuning();
            } else {
                this.stopTuning();
            }
        });

        // 播放參考音按鈕
        this.elements.playReference.addEventListener('click', () => {
            if (this.currentString) {
                this.playReferenceNote(this.currentString.freq);
            }
        });

        // 模態框關閉按鈕
        this.elements.modalCloseBtn.addEventListener('click', () => {
            this.elements.modal.style.display = 'none';
        });
    }

    async startTuning() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
            
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = CONFIG.fftSize;
            this.analyser.smoothingTimeConstant = CONFIG.smoothingTimeConstant;
            
            source.connect(this.analyser);
            
            this.isListening = true;
            this.elements.startButton.textContent = '停止調音';
            this.elements.statusMessage.textContent = '正在收音...';
            
            this.updateTuner();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showMicPermissionModal();
        }
    }

    stopTuning() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
        }
        this.isListening = false;
        this.elements.startButton.textContent = '開始調音';
        this.elements.statusMessage.textContent = '請允許使用麥克風';
    }

    setMode(mode) {
        this.currentMode = mode;
        this.elements.modeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.mode === mode);
        });
        this.renderStringsDisplay();
    }

    renderStringsDisplay() {
        const strings = TUNING_MODES[this.currentMode].strings;
        this.elements.stringsDisplay.innerHTML = strings.map(string => `
            <div class="string-row" data-string="${string.number}">
                <span class="string-number">${string.number}</span>
                <span class="string-note">${string.note}</span>
                <span class="string-frequency">${string.freq.toFixed(2)} Hz</span>
            </div>
        `).join('');

        // 為每個弦添加點擊事件
        document.querySelectorAll('.string-row').forEach(row => {
            row.addEventListener('click', () => {
                const stringNumber = parseInt(row.dataset.string);
                this.selectString(stringNumber);
            });
        });
    }

    selectString(stringNumber) {
        const strings = TUNING_MODES[this.currentMode].strings;
        this.currentString = strings.find(s => s.number === stringNumber);
        
        document.querySelectorAll('.string-row').forEach(row => {
            row.classList.toggle('active', parseInt(row.dataset.string) === stringNumber);
        });

        if (this.currentString) {
            this.elements.currentString.textContent = `第 ${this.currentString.number} 弦`;
            this.elements.targetFrequency.textContent = `目標: ${this.currentString.freq.toFixed(2)} Hz`;
        }
    }

    updateTuner() {
        if (!this.isListening) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(dataArray);

        // 更新音量計
        this.volumeMeter.update(dataArray);

        // 使用自相關算法檢測基頻
        const frequency = this.detectPitch(dataArray);
        
        if (frequency && this.currentString) {
            const cents = this.calculateCents(frequency, this.currentString.freq);
            this.updateDisplay(frequency, cents);
        }

        requestAnimationFrame(() => this.updateTuner());
    }

    detectPitch(buffer) {
        // 使用自相關算法檢測音高
        const correlation = new Float32Array(buffer.length/2);
        for (let i = 0; i < correlation.length; i++) {
            let sum = 0;
            for (let j = 0; j < correlation.length; j++) {
                sum += buffer[j] * buffer[j+i];
            }
            correlation[i] = sum;
        }

        // 尋找第一個峰值
        let peak = 0;
        for (let i = 1; i < correlation.length; i++) {
            if (correlation[i] > correlation[peak]) {
                peak = i;
            }
        }

        const sampleRate = this.audioContext.sampleRate;
        return sampleRate / peak;
    }

    calculateCents(frequency, targetFrequency) {
        return Math.round(1200 * Math.log2(frequency / targetFrequency));
    }

    updateDisplay(frequency, cents) {
        this.elements.currentFrequency.textContent = `${frequency.toFixed(2)} Hz`;
        this.elements.centsDisplay.textContent = `偏差: ${cents} cents`;

        // 更新指針位置
        const needlePosition = Math.max(-50, Math.min(50, cents)) + 50;
        this.elements.indicatorNeedle.style.left = `${needlePosition}%`;
    }

    playReferenceNote(frequency) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    showMicPermissionModal() {
        this.elements.modal.style.display = 'block';
        
        // 根據設備類型顯示不同的提示信息
        const deviceSpecificMessage = document.getElementById('deviceSpecificMessage');
        const permissionSteps = document.getElementById('permissionSteps');
        
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            deviceSpecificMessage.textContent = '在 iOS 設備上使用調音器需要允許麥克風權限';
            permissionSteps.innerHTML = `
                <ol>
                    <li>點擊 Safari 瀏覽器底部的「AA」按鈕</li>
                    <li>選擇「網站設定」</li>
                    <li>允許「麥克風」權限</li>
                    <li>重新整理頁面</li>
                </ol>
            `;
        } else if (/Android/.test(navigator.userAgent)) {
            deviceSpecificMessage.textContent = '在 Android 設備上使用調音器需要允許麥克風權限';
            permissionSteps.innerHTML = `
                <ol>
                    <li>點擊瀏覽器網址列左側的鎖頭圖示</li>
                    <li>找到「麥克風」權限設定</li>
                    <li>選擇「允許」</li>
                    <li>重新整理頁面</li>
                </ol>
            `;
        } else {
            deviceSpecificMessage.textContent = '請允許瀏覽器使用麥克風';
            permissionSteps.innerHTML = `
                <ol>
                    <li>點擊瀏覽器網址列的麥克風圖示</li>
                    <li>選擇「允許」</li>
                    <li>重新整理頁面</li>
                </ol>
            `;
        }
    }
}

class VolumeMeter {
    constructor(container, barCount = 32) {
        this.container = container;
        this.barCount = barCount;
        this.bars = [];
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        for (let i = 0; i < this.barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'volume-bar';
            this.container.appendChild(bar);
            this.bars.push(bar);
        }
    }

    update(audioData) {
        const values = this.getAverages(audioData);
        const maxValue = Math.max(...values, 1);
        
        this.bars.forEach((bar, index) => {
            const value = values[index] / maxValue;
            bar.style.height = `${value * 100}%`;
            bar.classList.toggle('active', value > 0.1);
        });
    }

    getAverages(audioData) {
        const sectionSize = Math.floor(audioData.length / this.barCount);
        const averages = [];

        for (let i = 0; i < this.barCount; i++) {
            const start = i * sectionSize;
            const end = start + sectionSize;
            let sum = 0;

            for (let j = start; j < end; j++) {
                sum += Math.abs(audioData[j]);
            }

            averages.push(sum / sectionSize);
        }

        return averages;
    }
}

// 初始化調音器
document.addEventListener('DOMContentLoaded', () => {
    const tuner = new Tuner();
    tuner.setMode('D'); // 默認設置為 D 調
});
