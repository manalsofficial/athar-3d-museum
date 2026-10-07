import { useEffect, useRef } from "react";

export function MuseumAmbience() {

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  useEffect(() => {

    const audio =
      new Audio("/audio/museum-ambience.mp3");

    audio.loop = true;

    audio.volume = 0.10;

    audioRef.current = audio;


    const startAudio = () => {

      audio.play().catch(() => {});

      window.removeEventListener(
        "pointerdown",
        startAudio
      );

    };


    window.addEventListener(
      "pointerdown",
      startAudio
    );


    return () => {

      audio.pause();

      audio.currentTime = 0;

      window.removeEventListener(
        "pointerdown",
        startAudio
      );

    };

  }, []);


  return null;
}