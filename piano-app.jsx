import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SONGS } from './songs';



const NOTE_FREQUENCIES = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
};

const PIANO_KEYS = [
  { note: 'C3', type: 'white' }, { note: 'D3', type: 'white' }, { note: 'E3', type: 'white' },
  { note: 'F3', type: 'white' }, { note: 'G3', type: 'white' }, { note: 'A3', type: 'white' }, { note: 'B3', type: 'white' },
  { note: 'C4', type: 'white' }, { note: 'D4', type: 'white' }, { note: 'E4', type: 'white' },
  { note: 'F4', type: 'white' }, { note: 'G4', type: 'white' }, { note: 'A4', type: 'white' }, { note: 'B4', type: 'white' },
  { note: 'C5', type: 'white' }, { note: 'D5', type: 'white' }, { note: 'E5', type: 'white' },
  { note: 'F5', type: 'white' }, { note: 'G5', type: 'white' }, { note: 'A5', type: 'white' }, { note: 'B5', type: 'white' }
];

const MACHINE_SOUNDS = {
  // Low Octave: Construction/Heavy
  'C3': { id: 'tractor', icon: '🚜' },
  'D3': { id: 'bulldozer', icon: '🚜' },
  'E3': { id: 'excavator', icon: '🏗️' },
  'F3': { id: 'dump_truck', icon: '🚚' },
  'G3': { id: 'concrete_mixer', icon: '🎰' }, // Mixer fallback icon choice
  'A3': { id: 'autocrane', icon: '🏗️' },
  'B3': { id: 'garbage_truck', icon: '🗑️' },

  // Mid Octave: Public Transit/Water
  'C4': { id: 'bus', icon: '🚌' },
  'D4': { id: 'trolleybus', icon: '🚎' },
  'E4': { id: 'tram', icon: '🚋' },
  'F4': { id: 'train', icon: '🚂' },
  'G4': { id: 'metro', icon: '🚇' },
  'A4': { id: 'ferry', icon: '⛴️' },
  'B4': { id: 'water_taxi', icon: '🚤' },

  // High Octave: Emergency/Air/Service
  'C5': { id: 'taxi', icon: '🚕' },
  'D5': { id: 'police', icon: '🚓' },
  'E5': { id: 'fire_truck', icon: '🚒' },
  'F5': { id: 'ambulance', icon: '🚑' },
  'G5': { id: 'tow_truck', icon: '🛻' },
  'A5': { id: 'helicopter', icon: '🚁' },
  'B5': { id: 'plane', icon: '✈️' }
};

const ANIMAL_SOUNDS = {
  // Low Octave: Farm
  'C3': { id: 'cow', icon: '🐄' }, 'D3': { id: 'horse', icon: '🐎' }, 'E3': { id: 'pig', icon: '🐖' },
  'F3': { id: 'sheep', icon: '🐑' }, 'G3': { id: 'donkey', icon: '🫏' }, 'A3': { id: 'goat', icon: '🐐' }, 'B3': { id: 'rooster', icon: '🐓' },

  // Mid Octave: Wild/Pets
  'C4': { id: 'bear', icon: '🐻' }, 'D4': { id: 'wolf', icon: '🐺' }, 'E4': { id: 'fox', icon: '🦊' },
  'F4': { id: 'eagle', icon: '🦅' }, 'G4': { id: 'owl', icon: '🦉' }, 'A4': { id: 'dog', icon: '🐕' }, 'B4': { id: 'cat', icon: '🐈' },

  // High Octave: Small/Birds
  'C5': { id: 'chicken', icon: '🐔' }, 'D5': { id: 'duck', icon: '🦆' }, 'E5': { id: 'crow', icon: '🐦' },
  'F5': { id: 'bee', icon: '🐝' }, 'G5': { id: 'fly', icon: '🪰' }, 'A5': { id: 'mosquito', icon: '🦟' }, 'B5': { id: 'cricket', icon: '🦗' }
};

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default function PianoApp() {
  const [screen, setScreen] = useState('selection');
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [instrument, setInstrument] = useState('piano');
  const audioContextRef = useRef(null);
  const audioBuffersRef = useRef({});

  const INSTRUMENTS = [
    { id: 'piano', name: 'Piano', icon: '🎹' },
    { id: 'bells', name: 'Bells', icon: '🔔' },
    { id: 'guitar', name: 'Guitar', icon: '🎸' },
    { id: 'machine', name: 'Machines', icon: '🚗' },
    { id: 'animals', name: 'Animals', icon: '🐈' }
  ];

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Load machine and animal sounds on mount
  useEffect(() => {
    const loadSounds = async () => {
      const ctx = getAudioContext();
      const allSoundConfigs = [...Object.values(MACHINE_SOUNDS), ...Object.values(ANIMAL_SOUNDS)];

      for (const config of allSoundConfigs) {
        try {
          // Avoid reloading if already exists
          if (audioBuffersRef.current[config.id]) continue;

          const response = await fetch(`${import.meta.env.BASE_URL}sounds/${config.id}.mp3`);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            audioBuffersRef.current[config.id] = audioBuffer;
          }
        } catch (error) {
          console.error(`Failed to load sound for ${config.id}:`, error);
        }
      }
    };
    loadSounds();
  }, [getAudioContext]);

  const playNote = useCallback((note) => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const freq = NOTE_FREQUENCIES[note];

    if (instrument === 'piano') {
      // Warm sine wave piano sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.8);
    } else if (instrument === 'bells') {
      // Bell sound with harmonics
      const fundamental = ctx.createOscillator();
      const harmonic1 = ctx.createOscillator();
      const harmonic2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      fundamental.type = 'sine';
      fundamental.frequency.setValueAtTime(freq, ctx.currentTime);

      harmonic1.type = 'sine';
      harmonic1.frequency.setValueAtTime(freq * 2.4, ctx.currentTime);

      harmonic2.type = 'sine';
      harmonic2.frequency.setValueAtTime(freq * 5.95, ctx.currentTime);

      const fundGain = ctx.createGain();
      const harm1Gain = ctx.createGain();
      const harm2Gain = ctx.createGain();

      fundGain.gain.setValueAtTime(0.4, ctx.currentTime);
      harm1Gain.gain.setValueAtTime(0.2, ctx.currentTime);
      harm2Gain.gain.setValueAtTime(0.1, ctx.currentTime);

      fundamental.connect(fundGain);
      harmonic1.connect(harm1Gain);
      harmonic2.connect(harm2Gain);

      fundGain.connect(gainNode);
      harm1Gain.connect(gainNode);
      harm2Gain.connect(gainNode);

      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      gainNode.connect(ctx.destination);

      fundamental.start(ctx.currentTime);
      harmonic1.start(ctx.currentTime);
      harmonic2.start(ctx.currentTime);
      fundamental.stop(ctx.currentTime + 1.5);
      harmonic1.stop(ctx.currentTime + 1.5);
      harmonic2.stop(ctx.currentTime + 1.5);
    } else if (instrument === 'guitar') {
      // Electric guitar with distortion
      const oscillator = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const distortion = ctx.createWaveShaper();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(freq * 1.005, ctx.currentTime);

      // Create distortion curve
      const makeDistortionCurve = (amount) => {
        const samples = 44100;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
        }
        return curve;
      };

      distortion.curve = makeDistortionCurve(50);
      distortion.oversample = '4x';

      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(2000, ctx.currentTime);

      const osc1Gain = ctx.createGain();
      const osc2Gain = ctx.createGain();
      osc1Gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc2Gain.gain.setValueAtTime(0.15, ctx.currentTime);

      oscillator.connect(osc1Gain);
      oscillator2.connect(osc2Gain);
      osc1Gain.connect(distortion);
      osc2Gain.connect(distortion);
      distortion.connect(filterNode);
      filterNode.connect(gainNode);

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.6);
      oscillator2.stop(ctx.currentTime + 0.6);
    } else if (instrument === 'machine' || instrument === 'animals') {
      const source = instrument === 'machine' ? MACHINE_SOUNDS : ANIMAL_SOUNDS;
      const sound = source[note];

      // Try file playback first
      if (sound && audioBuffersRef.current[sound.id]) {
        try {
          const sourceNode = ctx.createBufferSource();
          sourceNode.buffer = audioBuffersRef.current[sound.id];

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0); // Longer fade for samples

          sourceNode.connect(gainNode);
          gainNode.connect(ctx.destination);

          sourceNode.start(ctx.currentTime);
          return;
        } catch (e) {
          console.error("Error playing buffer, falling back to synth", e);
        }
      }

      // Fallback synthesis if file not loaded
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  }, [getAudioContext, instrument]);

  const playCelebrationSound = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const notes = ['C4', 'E4', 'G4', 'C5'];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(NOTE_FREQUENCIES[note], ctx.currentTime);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
      }, i * 150);
    });
  }, [getAudioContext]);

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const lastPlayedTimeRef = useRef({});

  const handleKeyPress = useCallback((note) => {
    // Prevent double-triggering on touch devices and limit repeat rate
    const now = Date.now();
    const lastTime = lastPlayedTimeRef.current[note] || 0;

    // Increased backoff to 700ms per note to handle longer presses
    if (now - lastTime < 700) {
      return;
    }
    lastPlayedTimeRef.current[note] = now;

    playNote(note);

    if (selectedSong && currentNoteIndex < selectedSong.notes.length) {
      const expectedNote = selectedSong.notes[currentNoteIndex];
      if (note === expectedNote) {
        setPlayedNotes(prev => [...prev, note]);
        if (currentNoteIndex + 1 >= selectedSong.notes.length) {
          // End of the melody iteration
          const verses = selectedSong.verses;
          if (currentVerseIndex + 1 < verses.length) {
            // Move to next verse
            setTimeout(() => {
              setCurrentVerseIndex(prev => prev + 1);
              setCurrentNoteIndex(0);
              setPlayedNotes([]);
            }, 300); // Small delay before next verse starts
          } else {
            // End of song
            setTimeout(() => {
              setShowCelebration(true);
              playCelebrationSound();
            }, 300);
          }
        } else {
          setCurrentNoteIndex(prev => prev + 1);
        }
      }
    }
  }, [selectedSong, currentNoteIndex, currentVerseIndex, playNote, playCelebrationSound]);

  const selectSong = (song) => {
    setSelectedSong(song);
    setCurrentNoteIndex(0);
    setCurrentVerseIndex(0);
    setPlayedNotes([]);
    setShowCelebration(false);
    setScreen('piano');
  };

  const startFreeplay = () => {
    setSelectedSong(null);
    setCurrentNoteIndex(0);
    setPlayedNotes([]);
    setScreen('freeplay');
    // Default to machine sounds if in freeplay? Optional, but user asked for machine noises in freeplay.
    // Let's not force it, but make it available. 
  };

  const goBack = () => {
    setScreen('selection');
    setSelectedSong(null);
    setCurrentNoteIndex(0);
    setCurrentVerseIndex(0);
    setPlayedNotes([]);
    setShowCelebration(false);
  };

  const restartSong = () => {
    setCurrentNoteIndex(0);
    setCurrentVerseIndex(0);
    setPlayedNotes([]);
    setShowCelebration(false);
  };

  if (screen === 'selection') {
    return (
      <div className="h-screen w-full overflow-y-auto bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 p-4">
        <h1 className="text-4xl font-bold text-white text-center mb-3 drop-shadow-lg">
          🎵 Pick a Song! 🎵
        </h1>

        <div className="flex justify-center gap-3 mb-4">
          {INSTRUMENTS.map(inst => (
            <button
              key={inst.id}
              onClick={() => setInstrument(inst.id)}
              className={`
                px-5 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-200
                flex items-center gap-2 active:scale-95
                ${instrument === inst.id
                  ? 'bg-white text-purple-600 scale-105 ring-4 ring-yellow-400'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'}
              `}
            >
              <span className="text-2xl">{inst.icon}</span>
              <span>{inst.name}</span>
            </button>
          ))}
        </div>

        {/* Freeplay Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={startFreeplay}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-6 rounded-3xl text-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all transform flex items-center gap-4 active:scale-95 border-4 border-white/30"
          >
            <span className="text-5xl">🎹</span>
            <div className="flex flex-col items-start">
              <span>Free Play Mode</span>
              <span className="text-sm opacity-90 font-normal">Play anything you want!</span>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-6xl mx-auto">
          {SONGS.map(song => (
            <button
              key={song.id}
              onClick={() => selectSong(song)}
              className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-24 active:scale-95"
            >
              <span className="text-4xl">{song.icon}</span>
              <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
                {song.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showCelebration) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 flex flex-col items-center justify-center p-8">
        <div className="text-center animate-bounce">
          <div className="text-8xl mb-4">🎉🌟🎉</div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Amazing Job!
          </h1>
          <p className="text-2xl text-white mb-8 drop-shadow">
            You played "{selectedSong.title}" perfectly!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={restartSong}
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={goBack}
              className="bg-white text-green-600 px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              🎵 New Song
            </button>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {['⭐', '🌟', '✨', '🎵', '🎶'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentExpectedNote = selectedSong?.notes[currentNoteIndex];
  // Calculate current lyric based on verse
  const activeVerses = selectedSong?.verses || [];
  const currentVerseLyrics = activeVerses[currentVerseIndex] || [];
  const currentLyric = currentVerseLyrics[currentNoteIndex] || '';

  // Progress across all verses
  const totalNotes = (selectedSong?.notes.length || 0) * activeVerses.length;
  const notesPlayedTotal = (currentVerseIndex * (selectedSong?.notes.length || 0)) + currentNoteIndex;
  const progress = totalNotes > 0 ? (notesPlayedTotal / totalNotes) * 100 : 0;

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-b from-blue-400 to-purple-500 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white/20 backdrop-blur">
        <button
          onClick={goBack}
          className="bg-white/90 text-purple-600 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedSong?.icon}</span>
          <h2 className="text-2xl font-bold text-white drop-shadow">{selectedSong?.title}</h2>
        </div>
        <button
          onClick={restartSong}
          className="bg-white/90 text-orange-500 px-4 py-2 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
        >
          🔄 Restart
        </button>
      </div>

      {/* Progress Bar - Only valid if song selected */}
      {selectedSong && (
        <div className="px-4 py-2">
          <div className="h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-white mt-1 text-sm px-2">
            <span>Verse {currentVerseIndex + 1} / {activeVerses.length}</span>
            <span>{notesPlayedTotal} / {totalNotes} notes</span>
          </div>
        </div>
      )}

      {/* Freeplay Controls */}
      {screen === 'freeplay' && (
        <div className="flex justify-center gap-3 my-4">
          {INSTRUMENTS.map(inst => (
            <button
              key={inst.id}
              onClick={() => setInstrument(inst.id)}
              className={`
                px-4 py-2 rounded-full font-bold shadow-lg transition-all duration-200
                flex items-center gap-2 active:scale-95
                ${instrument === inst.id
                  ? 'bg-white text-purple-600 scale-105 ring-4 ring-yellow-400'
                  : 'bg-white/60 text-gray-700 hover:bg-white/80'}
              `}
            >
              <span className="text-xl">{inst.icon}</span>
              <span>{inst.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Lyrics Display - Only in song mode */}
      {selectedSong && (
        <div className="flex-shrink-0 px-4 py-4 overflow-hidden relative w-full flex justify-center">
          <div className="bg-white/90 rounded-2xl p-6 shadow-xl w-full max-w-4xl overflow-hidden relative">

            {/* Scrolling Lyrics Container */}
            <div
              className="flex items-center transition-transform duration-500 ease-out will-change-transform"
              style={{
                transform: `translateX(calc(50% - ${(currentNoteIndex * 120) + 60}px))` /* Approximate centering based on width */
              }}
            >
              {selectedSong?.verses?.[currentVerseIndex]?.map((lyric, idx) => (
                <div
                  key={idx}
                  className={`
                      flex-shrink-0 w-[120px] text-center transition-all duration-300
                      ${idx === currentNoteIndex ? 'scale-125 z-10' : 'scale-100 opacity-60'}
                    `}
                >
                  <span
                    className={`
                        text-4xl font-black px-3 py-2 rounded-xl inline-block
                        ${idx < currentNoteIndex
                        ? 'text-green-500'
                        : idx === currentNoteIndex
                          ? 'text-purple-600 bg-yellow-300 shadow-lg animate-bounce'
                          : 'text-gray-400'}
                      `}
                  >
                    {lyric}
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white/90 to-transparent z-20 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white/90 to-transparent z-20 pointer-events-none" />

            <p className="text-center text-purple-600 font-bold mt-6 text-2xl relative z-30">
              Press <span className="text-yellow-500 text-3xl bg-white px-3 rounded-lg shadow-sm border-2 border-yellow-400 mx-2">{currentExpectedNote}</span> !
            </p>
          </div>
        </div>
      )}

      {/* Piano - Full height flex container */}
      <div className="flex-1 flex items-stretch pb-0 px-0 overflow-hidden relative">
        <div className="w-full flex justify-center h-full">
          <div className="flex w-full h-full">
            {PIANO_KEYS.map((key, idx) => {
              const isHighlighted = key.note === currentExpectedNote;
              const wasPlayed = playedNotes.includes(key.note) && selectedSong?.notes.filter(n => n === key.note).length > 0;

              return (
                <button
                  key={idx}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyPress(key.note);
                  }}
                  onMouseDown={() => handleKeyPress(key.note)}
                  className={`
                    relative flex flex-col items-center justify-end pb-4
                    transition-all duration-100 select-none
                    ${key.type === 'white'
                      ? `flex-1 h-full bg-white border-2 border-gray-300 rounded-b-xl shadow-lg z-0
                         active:bg-gray-200 hover:bg-gray-50
                         ${isHighlighted ? 'bg-yellow-300 border-yellow-500 animate-pulse shadow-yellow-400 shadow-inner' : ''}`
                      : `w-[5%] h-[60%] bg-gray-800 border-2 border-gray-900 rounded-b-lg shadow-md -mx-[2.5%] z-10
                         active:bg-gray-700
                         ${isHighlighted ? 'bg-yellow-500 border-yellow-600 animate-pulse' : ''}`
                    }
                  `}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="flex flex-col items-center pointer-events-none">
                    {/* Machine Icon */}
                    {instrument === 'machine' && MACHINE_SOUNDS[key.note] && (
                      <span className="text-4xl mb-4 filter drop-shadow opacity-90 transition-transform duration-200 transform group-active:scale-110">{MACHINE_SOUNDS[key.note].icon}</span>
                    )}

                    {/* Animal Icon */}
                    {instrument === 'animals' && ANIMAL_SOUNDS[key.note] && (
                      <span className="text-4xl mb-4 filter drop-shadow opacity-90 transition-transform duration-200 transform group-active:scale-110">{ANIMAL_SOUNDS[key.note].icon}</span>
                    )}

                    <span className={`
                      font-bold
                      ${key.type === 'white' ? 'text-gray-600 text-xl' : 'text-gray-300 text-sm'}
                      ${isHighlighted ? 'text-purple-700 text-2xl scale-125' : ''}
                    `}>
                      {key.note}
                    </span>
                  </div>
                  {isHighlighted && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2">
                      <span className="text-2xl">👇</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
