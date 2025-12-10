from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (SpectacularAPIView, SpectacularSwaggerView)
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

    
urlpatterns = [
    path("api/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="schema-swagger-ui"),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),

    # path("accounts/", include("allauth.urls")),            # Google login redirect URLs
    # path("auth/", include("dj_rest_auth.urls")),           # API auth endpoints
    # path("auth/registration/", include("dj_rest_auth.registration.urls")),
    
    
    # path("auth/google/", GoogleLogin.as_view(), name="google_login"),

]
