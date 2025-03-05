const CONFIG = {
    tolerance: 2,
    smoothingTimeConstant: 0.8,
    fftSize: 2048,
    updateInterval: 50
};

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
            { number: 21, note: 'G2', freq: 98.
