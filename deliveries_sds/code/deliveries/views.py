from django.db.models import Q, Sum
from django.http import HttpResponse
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, renderer_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework.response import Response
import datetime
import dateutil.parser

from . import models
from . import serializers





@api_view(('GET',))
@renderer_classes((JSONRenderer,BrowsableAPIRenderer))
def getSuppliers(request):
    suppliers_qs = models.Supplier.objects.all()
    serializer = serializers.SupplierSerializer(suppliers_qs,many=True)
    return Response(serializer.data)

@api_view(('GET',))
@renderer_classes((JSONRenderer,BrowsableAPIRenderer))
def getUsers(request):
    users_qs = models.User.objects.all()
    serializer = serializers.UserSerializer(users_qs,many=True)
    return Response(serializer.data)

@api_view(('GET',))
@renderer_classes((JSONRenderer,BrowsableAPIRenderer))
def getProducts(request):
    products_qs = models.Product.objects.all()
    serializer = serializers.ProductSerializer(products_qs,many=True)
    return Response(serializer.data)

@api_view(('GET',))
@renderer_classes((JSONRenderer,BrowsableAPIRenderer))
def getPackout(request,date):
    product_totals = models.PalletItem.objects.filter(timestamp__date=date).values('product').annotate(total_quantity=Sum('quantity'))
    print(product_totals)
    serializer = serializers.ProductTotalSerializer(product_totals, many=True)
    return Response(serializer.data)