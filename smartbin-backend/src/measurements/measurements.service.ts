import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateMeasurementDto } from './dto/measurement.dto';

@Injectable()
export class MeasurementsService {
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

  async saveMeasurement(data: CreateMeasurementDto) {
    const point = Point.measurement('smartbin_measurements')
      .setTag('device_id', data.device_id)
      .setFloatField('fill_level', data.fill_level)
      .setFloatField('battery_level', data.battery)
      .setTimestamp(new Date(data.timestamp).getTime());

    await this.influx.write([point], undefined, undefined, {
      precision: 'ms',
    });
  }

  async getAllMeasurements() {
    const queryResults = this.influx.query(
      `SELECT * FROM "smartbin_measurements"`,
      undefined,
      {
        type: 'sql',
      },
    );

    const results: CreateMeasurementDto[] = [];
    for await (const row of queryResults) {
      results.push(row as CreateMeasurementDto);
    }
    return results;
  }
}
