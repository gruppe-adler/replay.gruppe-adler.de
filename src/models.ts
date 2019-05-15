export default interface Replay {
    id: number;
    missionName: string;
    date: Date;
    duration: number;
    worldName: string;
    data?: Array<Array<[string, number, [number, number], number, string, string, [number, number]|[]]|number>>;
}
