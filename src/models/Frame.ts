import {
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
    Unique,
    HasMany,
    DefaultScope,
    ForeignKey
} from 'sequelize-typescript';

import { Record } from './Record';
import { Replay } from './Replay';

@DefaultScope({
    include: [ () => Record ],
    attributes: { exclude: [ 'replayId' ] }
})
@Table({
    timestamps: false
})
export class Frame extends Model<Frame> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    public id!: number;
    
    @Column(DataType.TEXT)
    public time!: string;
    
    @HasMany(() => Record)
    data!: Record[];

    @ForeignKey(() => Replay)
    @Column(DataType.INTEGER)
    public replayId!: number;
}
