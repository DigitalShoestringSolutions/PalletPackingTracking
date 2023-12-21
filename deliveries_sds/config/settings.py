import datetime

MQTT = {
        'broker':'mqtt.docker.local',
        'port':1883,
        'id':'deliveries_db',
        'sub_topics':['delivery_details/#']
    }

DELETE_ON_COMPLETE=True
DELETE_THRESHOLD = datetime.timedelta(days=0)


