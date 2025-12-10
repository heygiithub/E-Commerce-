from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductImageViewSet,RegisterCustomerView,VendorProductViewSet, ProductListView,CartView,VendorDashboardView, OrderView,AdminOrderView,CustomerAddressViewSet,LoginView,RegisterVendorView,VendorOrderView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# Register viewsets with a router (ProductListView is a ModelViewSet)
router = DefaultRouter()
router.register(r'products', ProductListView, basename='products')
router.register(r'vendor/products',VendorProductViewSet,basename='vendor-products')
router.register(r'categories',CategoryViewSet,basename='categories')
router.register(r'product-images',ProductImageViewSet,basename='product-images')
customer_address = CustomerAddressViewSet.as_view({'get':'list','post':'create'})
urlpatterns = [
    
    # Router URLs for viewsets
    path('', include(router.urls)),
    
    # for login ,register
    path('register/customer/',RegisterCustomerView.as_view(),name='register-customer'),
    path('register/vendor/',RegisterVendorView.as_view(),name='register-vendor'),
    path('login/',LoginView.as_view(),name='login'),
    # for jwt authentication
    path('token/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),

    # Vendor product endpoints (APIView-based)
   
    # path('vendor/dashboard/<int:pk>/', VendorProductView.as_view(), name='vendor-product-detail'),
    path('vendor/orders/',VendorOrderView.as_view(),name='vendor-orders'),
    path('dashboard/',VendorDashboardView.as_view(),name="vendor-dashboard"),
   
    # Customer endpoints (orders and cart) - APIView-based
    path('customer/orders/', OrderView.as_view(), name='customer-orders'),
    path('customer/orders/<int:pk>/', OrderView.as_view(), name='customer-order-detail'),
    path('customer/cart/', CartView.as_view(), name='customer-cart'),
    path('customer/cart/<int:pk>/', CartView.as_view(), name='customer-cart-item'),
    path('customer/addresses/',customer_address,name='customer-addresses'),
    path('admin/orders/<int:pk>/',AdminOrderView.as_view(), name='admin-orders'),
    
]
