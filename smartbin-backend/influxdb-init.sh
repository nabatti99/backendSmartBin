# InfluxDB 3.x Core
docker run --name influxdb -d \
    -p 8181:8181 \
    influxdb:3-core influxdb3 serve \
    --node-id=my-node-0 \
    --object-store=file

# InfluxDB 3.x UI (Explorer)
docker run --name influxdb-explorer -d \
  -p 8888:80 \
  -p 8889:8888 \
  influxdata/influxdb3-ui \
  --mode=admin