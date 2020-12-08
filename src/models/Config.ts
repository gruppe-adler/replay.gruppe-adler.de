import {
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
    Unique,
    ForeignKey,
    DefaultScope
} from 'sequelize-typescript';
import { Replay } from './Replay';

@DefaultScope(() => ({
    attributes: { exclude: [ 'replayId' ] },
}))
@Table
export class Config extends Model<Config> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    public id!: number;
    
    @Column(DataType.INTEGER)
    public precision!: number;

    @Column(DataType.INTEGER)
    public sendingChunkSize!: number;

    @Column(DataType.INTEGER)
    public stepsPerTick!: number;

    @Column(DataType.BOOLEAN)
    public trackShots!: boolean;

    @Column(DataType.BOOLEAN)
    public trackedAI!: boolean;

    @Column(DataType.JSON)
    private trackedSides!: string[];

    @Column(DataType.BOOLEAN)
    public trackedVehicles!: boolean;

    @ForeignKey(() => Replay)
    @Column(DataType.INTEGER)
    public replayId!: number;
}