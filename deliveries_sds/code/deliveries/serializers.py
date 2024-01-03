from rest_framework import serializers

from . import models

# class StateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model=State
#         fields = ('record_id','item_id','location_link',"start","end","quantity")

    # def to_representation(self, obj):
        # rep = super().to_representation(obj)
        # rep['location'] = rep['location']['name']
        # return rep





class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Supplier
        fields = ('id', 'supplier')




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ('id', 'initial')


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Product
        fields = ('id', 'product')


class ProductTotalSerializer(serializers.Serializer):
    product = serializers.CharField()
    total_quantity = serializers.IntegerField()