import {
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
    Unique,
    HasMany,
    HasOne,
    DefaultScope
} from 'sequelize-typescript';
import { Frame } from './Frame';
import { Config } from './Config';

@DefaultScope(() => ({
    include: [ Config ]
}))
@Table({
    timestamps: false
})
export class Replay extends Model<Replay> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    public id!: number;
    
    @Column(DataType.TEXT)
    public missionName!: string;

    @Column(DataType.DATE)
    public date!: Date;

    @Column(DataType.INTEGER)
    public duration!: number;

    @Column(DataType.TEXT)
    public worldName!: string;

    @Column(DataType.INTEGER)
    public frameCount!: number;

    @HasMany(() => Frame)
    public data!: Frame[];

    @HasOne(() => Config)
    public config!: Config;

}
