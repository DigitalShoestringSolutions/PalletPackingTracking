from django.urls import path,include
from rest_framework import routers
from . import views
# from django.shortcuts import redirect

# def redirect_root(request):
#     response = redirect('jobs/')
#     return response


urlpatterns= [ 
        path('suppliers/', views.getSuppliers),
        path('users/', views.getUsers),
        path('products/', views.getProducts)
    ]

#/state/                            ?t=timestamp
#/state/for/<item_id>               ?t=timestamp
#/state/at/<location_link>          ?t=timestamp
#/state/history                     ?from=timestamp ?to=timestamp
#/state/history/for/<item_id>       ?from=timestamp ?to=timestamp
#/state/history/at/<loction_link>   ?from=timestamp ?to=timestamp
