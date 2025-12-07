import { Injectable } from '@nestjs/common';
import { CreateTrashInfosDto } from './dto/trashInfos.dto';
import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TrashInfosService {
  private influx: InfluxDBClient;

  constructor(private configService: ConfigService) {
    const host = process.env.INFLUX_URL || 'http://localhost:8181'; // URL par défaut si non défini
    const token = process.env.INFLUX_TOKEN || 'my-token';
    const database = process.env.INFLUX_DATABASE || 'data';
    console.log(
      `Connecting to InfluxDB with URL: ${host}, Database: ${database}`,
    );

    this.influx = new InfluxDBClient({ host, token, database });
  }

  async saveTrashInfos(data: CreateTrashInfosDto) {
    const point = Point.measurement('smartbin_trashInfos')
      .setTag('device_id', data.device_id)
      .setStringField('type', data.type)
      .setFloatField('quantity', data.quantity)
      .setTimestamp(new Date(data.timestamp).getTime());

    await this.influx.write([point], undefined, undefined, {
      precision: 'ms',
    });
  }

  async getAllTrashInfos() {
    const queryResults = this.influx.query(
      `SELECT * FROM "smartbin_trashInfos"`,
      undefined,
      {
        type: 'sql',
      },
    );

    const results: CreateTrashInfosDto[] = [];
    for await (const row of queryResults) {
      results.push(row as CreateTrashInfosDto);
    }
    return results;
  }
}
