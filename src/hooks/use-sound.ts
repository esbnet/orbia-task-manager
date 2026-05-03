import { useCallback } from "react";

type SoundType = "create" | "update" | "delete" | "complete" | "archive";
type WaveType = "sine" | "square" | "triangle" | "sawtooth";

/**
 * Hook para reproduzir sinalizações sonoras bem distintas para ações de tarefas
 * Usa Web Audio API com frequências variadas (graves vs agudos) e tipos de onda
 */
export function useSound() {
    const playTone = useCallback(
        (
            frequency: number,
            duration: number,
            volume: number = 0.3,
            waveType: WaveType = "sine"
        ) => {
            try {
                const audioContext = new (window.AudioContext ||
                    (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = waveType;

                // Fade in/out para evitar cliques
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    volume,
                    audioContext.currentTime + 0.05
                );
                gainNode.gain.linearRampToValueAtTime(
                    0,
                    audioContext.currentTime + duration - 0.05
                );

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.warn("Não foi possível reproduzir som:", error);
            }
        },
        []
    );

    const playSequence = useCallback(
        (
            frequencies: number[],
            duration: number = 0.1,
            gap: number = 0.05,
            volume: number = 0.3,
            waveType: WaveType = "sine"
        ) => {
            frequencies.forEach((frequency, index) => {
                setTimeout(() => {
                    playTone(frequency, duration, volume, waveType);
                }, (duration + gap) * index);
            });
        },
        [playTone]
    );

    // INCLUSÃO: Agudo e brilhante - sequência ascendente rápida (triangle wave = som mais brilhante)
    // Frequências altas (E5, G5, B5) - bem agudas e alegres
    const playCreate = useCallback(() => {
        playSequence([659, 784, 988], 0.1, 0.06, 0.28, "triangle"); // E5, G5, B5 - agudo e alegre
    }, [playSequence]);

    // ALTERAÇÃO: Médio-agudo, nota única, curta e clara
    // Frequência média (400 Hz) - sine puro e discreto
    const playUpdate = useCallback(() => {
        playTone(400, 0.08, 0.18, "sine"); // A4 - médio e neutro
    }, [playTone]);

    // DELEÇÃO: Grave e áspero - aviso com descendente
    // Frequências graves (110-150 Hz), square wave (mais áspero) para indicar perigo
    const playDelete = useCallback(() => {
        playSequence([150, 110], 0.15, 0.12, 0.3, "square"); // D#3, A2 - grave e áspero
    }, [playSequence]);

    // CONCLUSÃO: Satisfatória - grave → médio → agudo
    // Frequências variadas (165-330 Hz), triangle para clareza
    const playComplete = useCallback(() => {
        playSequence([165, 220, 330], 0.12, 0.08, 0.3, "triangle"); // E3, A3, E4 - variação clara
    }, [playSequence]);

    // ARQUIVAMENTO: Bem grave e suave - som longo e discreto
    // Frequência muito grave (60 Hz), sine puro e longo
    const playArchive = useCallback(() => {
        playTone(60, 0.25, 0.2, "sine"); // B1 - bem grave e suave
    }, [playTone]);

    const play = useCallback(
        (type: SoundType) => {
            switch (type) {
                case "create":
                    playCreate();
                    break;
                case "update":
                    playUpdate();
                    break;
                case "delete":
                    playDelete();
                    break;
                case "complete":
                    playComplete();
                    break;
                case "archive":
                    playArchive();
                    break;
            }
        },
        [playCreate, playUpdate, playDelete, playComplete, playArchive]
    );

    return { play, playCreate, playUpdate, playDelete, playComplete, playArchive };
}
