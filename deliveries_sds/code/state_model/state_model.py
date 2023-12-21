import zmq
import json
import threading
from deliveries.models import Delivery, Bin, Email
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
            supplier = raw_msg['supplier']
            total_net_weight = raw_msg['totalNetWeight']
            total_gross_weight = raw_msg['totalGrossWeight']
            variety = raw_msg['variety']
            customer = raw_msg['customer']
            handpicked = raw_msg['handpicked']
            grape_code = raw_msg['grapeCode']
            fruit_condition = raw_msg['fruitCondition']
            mog = raw_msg['mog']
            comments = raw_msg['comments']
            tare = raw_msg['tare']
            user = raw_msg['user']
            bins = []
            for bin_data in raw_msg['bins']:
                bin_instance = Bin.objects.create(
                    bin_number=int(bin_data['binID']),
                    gross_weight=int(bin_data['grossWeight']),
                    net_weight=int(bin_data['netWeight'])  
                )
                bins.append(bin_instance)


            newDelivery = Delivery.objects.create(
                supplier=supplier,
                timestamp=timestamp,
                total_net_weight=total_net_weight,
                customer = customer,
                handpicked = handpicked,
                grapecode =  grape_code,
                fruitCondition = fruit_condition,
                mog = mog,
                total_gross_weight = total_gross_weight,
                tare = tare,
                user = user,
                comments = comments

            )

           
                
            newDelivery.bins.add(*bins)

            context = raw_msg
            context['timestamp'] = datetime.fromisoformat(context['timestamp'].replace('Z', '+00:00')).replace(tzinfo=pytz.UTC).astimezone(get_localzone()).strftime('%Y-%m-%d %H:%M:%S')
            html_content = render_to_string('email_template.html', context)
            emails = Email.objects.all()
            email_str_list = []
            for i in emails:
                print (i.email)
                email_str_list.append(i.email)

            send_mail(
                subject = 'New Delivery!',
                message = 'You have a new delivery!',
                html_message = html_content,
                from_email = 'deliverytracking@outlook.com',
                recipient_list = email_str_list,
                fail_silently=False,
            )

            print("Email sent")

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
