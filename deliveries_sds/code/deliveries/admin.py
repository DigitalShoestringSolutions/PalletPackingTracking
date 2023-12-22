from django.contrib import admin
from . import models
# from adminsortable.admin import SortableAdmin
import datetime
import time



@admin.register(models.Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['id', 'supplier']
    ordering = ['id']
    readonly_fields = ['id']

@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'product']
    ordering = ['id']
    readonly_fields = ['id']


@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'initial']
    ordering = ['id']
    readonly_fields = ['id']


# @admin.register(models.Delivery)
# class DeliveryAdmin(admin.ModelAdmin):
#     list_display = ['id', 'supplier', 'total_net_weight']
#     ordering = ['id']
#     readonly_fields = ['id']


@admin.register(models.Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ['id', 'email']
    ordering = ['id']
    readonly_fields = ['id']



@admin.register(models.Pallet)
class PalletAdmin(admin.ModelAdmin):
    list_display = ['id', 'timestamp', 'status']
    ordering = ['id']
    readonly_fields = ['id']

@admin.register(models.PalletItem)
class PalletItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'pallet', 'product', 'quantity']
    ordering = ['id']
    readonly_fields = ['id']
