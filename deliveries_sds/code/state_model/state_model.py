import zmq
import json
import threading
from deliveries.models import Delivery, Bin, Email, Pallet, PalletItem
# from tracking_events.models import TrackingEvent
from datetime import datetime
from tzlocal import get_localzone
import pytz
import dateutil.parser
from django.db import transaction
from django.core.mail import send_mail
from django.template.loader import render_to_string




context = zmq.Context()

class StateModel:
    def __init__(self,zmq_config):
        self.subsocket = context.socket(zmq.SUB)
        self.subsocket.connect(zmq_config['pub_ep'])
        self.subsocket.setsockopt(zmq.SUBSCRIBE, zmq_config['inbound_topic'].encode())

        self.pushsocket = context.socket(zmq.PUSH)
        self.pushsocket.connect(zmq_config['sub_ep'])


    def start(self):
        t = threading.Thread(target = self.run)
        t.start()

    def run(self):
        while True:
            msg = self.subsocket.recv_multipart()
            print("StateModel got:",msg)
            try:
                topic = msg[-2].decode().split('/')
                json_msg = json.loads(msg[-1])
                self.handle_message(json_msg)
            except Exception as e:
                print("ERROR")
                print(e.msg)

    def handle_message(self,raw_msg):
        print(f"handling: {raw_msg}")
        #listen for incoming events
        try:
            #validate
            timestamp = dateutil.parser.isoparse(raw_msg['timestamp'])
            start_time = dateutil.parser.isoparse(raw_msg['startTimeStamp'])
            user = raw_msg['user']
            

            newPallet = Pallet.objects.create(user=user, timestamp=timestamp, status='Packed', start_time=start_time)
            
            items = []
            for item_entry in raw_msg['items']:
                pallet_item_instance = PalletItem.objects.create(
                    product=item_entry['product'],
                    grower=item_entry['grower'],
                    quantity=int(item_entry['count']),
                    pallet=newPallet
                )
            
                items.append(pallet_item_instance)
            
            newPallet.items.set(items)

        #    INSERT CODE HERE TO SEND MQTT MESSAGE WITH PRINT TOPIC AND MESSAGE
                

            # context = raw_msg
            # context['timestamp'] = datetime.fromisoformat(context['timestamp'].replace('Z', '+00:00')).replace(tzinfo=pytz.UTC).astimezone(get_localzone()).strftime('%Y-%m-%d %H:%M:%S')
            # html_content = render_to_string('email_template.html', context)
            # emails = Email.objects.all()
            # email_str_list = []
            # for i in emails:
            #     print (i.email)
            #     email_str_list.append(i.email)

            # send_mail(
            #     subject = 'New Delivery!',
            #     message = 'You have a new delivery!',
            #     html_message = html_content,
            #     from_email = 'deliverytracking@outlook.com',
            #     recipient_list = email_str_list,
            #     fail_silently=False,
            # )

            # print("Email sent")

                # if newFromQuantity and newFromQuantity != 0:
                #     newFromState = State.objects.create(item_id=item_id,location_link=loc_link_from,start=timestamp,quantity=newFromQuantity)

            #send update event
            # to_update_msg = {
            #         'item_id':newToState.item_id,
            #         'location_link':newToState.location_link,
            #         'timestamp':newToState.start.isoformat(),
            #         'quantity':newToState.quantity
            #         }

            # print(to_update_msg)
            # #send update
            # self.pushsocket.send_multipart(["location_state/update".encode(),json.dumps(to_update_msg).encode()])

            
            # from_update_msg = {
            #     'item_id':item_id,
            #     'location_link':loc_link_from,
            #     'timestamp':timestamp.isoformat(),
            #     'quantity':newFromQuantity
            #     }
            # print(from_update_msg)
            # self.pushsocket.send_multipart(["location_state/update".encode(),json.dumps(from_update_msg).encode()])

        except Exception as e:
            print("ERROR")
            print (e)



def increment_quantity(base,amount):
    if base is None:
        return amount
    if amount is None:
        return base
    return base + amount

def decrement_quantity(base,amount):
    if base is None:
        return -1 * amount
    if amount is None:
        return base
    return base - amount
