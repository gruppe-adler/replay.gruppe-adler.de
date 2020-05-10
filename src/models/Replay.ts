export interface ReplayConfig {
    precision: number;
    sendingChunkSize: number;
    stepsPerTick: number;
    trackShots: boolean;
    trackedAI: boolean;
    trackedSides: string[];
    trackedVehicles: boolean;
}

export interface ReplayRecord {
    color: string;
    direction: number;
    group: string;
    icon: string;
    name: string;
    position: [number, number];
    target?: [number, number];
}

export interface ReplayFrame {
    time: string;
    data: ReplayRecord[];
}

export interface ReplayData {
    config: ReplayConfig;
    replay: ReplayFrame[];
}

export interface Replay {
    id: number;
    missionName: string;
    date: Date;
    duration: number;
    worldName: string;
    data?: ReplayData;
}
