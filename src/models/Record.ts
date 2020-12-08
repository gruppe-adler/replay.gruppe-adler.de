import {
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
    Unique,
    ForeignKey,
    DefaultScope,
    AllowNull,
    Index
} from 'sequelize-typescript';
import { Frame } from './Frame';

@DefaultScope(() => ({
    attributes: { exclude: ['frameId'] }
}))
@Table
export class Record extends Model<Record> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    public id!: number;

    @Column(DataType.JSON)
    public color!: [number, number, number, number];

    @Column(DataType.FLOAT)
    public direction!: number;

    @Column(DataType.TEXT)
    public group!: string;

    @Column(DataType.TEXT)
    public icon!: string;

    @Column(DataType.TEXT)
    public name!: string;

    @Column(DataType.JSON)
    public position!: [number, number];

    @AllowNull
    @Column(DataType.JSON)
    public target!: [number, number]|null;

    @Index
    @ForeignKey(() => Frame)
    @Column(DataType.INTEGER)
    public frameId!: number;
}
