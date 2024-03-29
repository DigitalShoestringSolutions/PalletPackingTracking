from django.db import models
from datetime import datetime



class Bin(models.Model):
    id = models.BigAutoField(primary_key=True)
    bin_number = models.PositiveIntegerField(default=0, editable=True)
    gross_weight = models.PositiveIntegerField(default=0, editable=True)
    net_weight = models.PositiveIntegerField(default=0, editable=True)

    def __str__(self):
        return str(self.id)


class Pallet(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.CharField(max_length=10, default='None')   
    timestamp = models.DateTimeField(default=datetime.now)
    status = models.CharField(max_length=10, default='Packed')
    items = models.ManyToManyField("PalletItem", related_name="pallets", blank=True)
    start_time = models.DateTimeField(null=True)


    def __str__(self):
        return str(self.id)


class PalletItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    grower =  models.CharField(null=True, max_length=60)
    product = models.CharField(null=True, max_length=60)
    quantity = models.PositiveIntegerField(default=0, editable=True)
    pallet = models.ForeignKey(Pallet, on_delete=models.CASCADE, null=True)
    timestamp = models.DateTimeField(default=datetime.now)
    def __str__(self):
        return str(self.id)

class Delivery(models.Model):
    id = models.BigAutoField(primary_key=True)
    supplier = models.CharField(max_length=60)
    customer = models.CharField(max_length=60)
    handpicked = models.BooleanField(default=False)
    grapecode =  models.CharField(max_length=20)
    fruitCondition = models.CharField(max_length=1)
    mog = models.PositiveIntegerField(default=0, editable=True)
    total_net_weight = models.PositiveIntegerField(default=0, editable=False)
    total_gross_weight = models.PositiveIntegerField(default=0, editable=False)
    tare = models.PositiveIntegerField(default=0, editable=False)
    comments = models.CharField(max_length=100)
    timestamp = models.DateTimeField()
    bins = models.ManyToManyField(Bin)
    user = models.CharField(max_length=10, null=True)
    
    class Meta:
        verbose_name = 'Delivery'
        verbose_name_plural = 'Deliveries'


    def __str__(self):
        return str(self.id)
    

class Supplier(models.Model):
    id = models.BigAutoField(primary_key=True)
    supplier = models.CharField(max_length=60)
    def __str__(self):
        return self.supplier

class Product(models.Model):
    id = models.BigAutoField(primary_key=True)
    product = models.CharField(max_length=60)
    def __str__(self):
        return self.product



class User(models.Model): 
    id = models.BigAutoField(primary_key=True)
    initial = models.CharField(max_length=3)
    def __str__(self):
        return self.initial



class Email(models.Model):
    id = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=60)
    
    def __str__(self):
        return self.email