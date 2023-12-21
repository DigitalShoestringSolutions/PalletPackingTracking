from django.db.models import Q
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

