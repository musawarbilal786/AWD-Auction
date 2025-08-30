"""
URL configuration for awd_auction_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # path("stripe/", include("djstripe.urls", namespace="djstripe")),
    path('admin/', admin.site.urls),
    path('users/api/v1/', include('users.api.v1.urls')),
    path('utils/api/v1/', include('utils.api.v1.urls')),
    path('inspections/api/v1/', include('inspections.api.v1.urls')),
    path('auctions/api/v1/', include('auctions.api.v1.urls')),
    path('transportation/api/v1/', include('transportation.api.v1.urls')),
    path("arbitration/api/v1/", include('arbitration.api.v1.urls')),
    path("communication/api/v1/", include('communications.api.v1.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)