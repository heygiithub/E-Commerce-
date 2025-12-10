from django.shortcuts import render,get_object_or_404,redirect
from rest_framework.views import APIView
from rest_framework import viewsets,filters
from rest_framework import status
from django.contrib.auth import authenticate 
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated,AllowAny,IsAdminUser
from rest_framework.response import Response
from .permissions import IsVendor,IsCustomer
from .models import (User,Product,Payment,ProductImage,Order,OrderItem,Address,Cart,CartItem,Category,Customer,Vendor)
from decimal import Decimal
from rest_framework.parsers import MultiPartParser,FormParser
from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import PermissionDenied
from . serializers import VendorProductSerializer,CustomerRegisterSerializer,LoginSerializer,CartSerializer,VendorRegisterSerializer,UserSerializer,OrderSerializer,VendorSerializer,VendorOrderSerializer,AddressSerializer,PaymentSerializer,ProductSerializer,CartItemSerializer,CategorySerializer,CustomerSerializer,OrderItemSerializer,ProductImageSerializer
from rest_framework.pagination import PageNumberPagination

# regiser vendor and customer
class RegisterVendorView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = VendorRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Vendor registered successfully"},status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class RegisterCustomerView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = CustomerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message":"Customer registered successfully"},status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

# user login view
class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            return Response(data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

     

# Create views for vendor only .


class VendorProductViewSet(viewsets.ModelViewSet):
    serializer_class = VendorProductSerializer
    permission_classes = [IsAuthenticated,IsVendor]
    
    def get_queryset(self):
        return Product.objects.filter(
            vendor=self.request.user.vendor_profile).prefetch_related("images")
    
    def list(self,request,*args,**kwargs):
        serializer = ProductSerializer(
            self.get_queryset(),many=True,context={'request':request}
        )
        return Response(serializer.data)
    
    def perform_create(self,serializer):
        serializer.save(vendor = self.request.user.vendor_profile)

# productImage add and delete for vendor
class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated,IsVendor]
    parser_classes = [MultiPartParser,FormParser]
    
    def get_queryset(self):
        qset = ProductImage.objects.filter(product__vendor=self.request.user.vendor_profile)
        product_id = self.request.query_params.get("product")
        
        if product_id:
            qset = qset.filter(product_id=product_id)
        return qset
    
    
    def perform_create(self, serializer):
        # product_id = self.kwargs.get('product_id')
        # product = get_object_or_404(Product, pk=product_id,vendor=self.request.user.vendor_profile)
        product = serializer.validated_data["product"]
        if product.vendor != self.request.user.vendor_profile:
            raise PermissionDenied("You do not own this product.")
        
        is_first = not ProductImage.objects.filter(
            product=product, is_primary=True).exists()
        serializer.save(is_primary=is_first)
        
        
    
    def perform_update(self,serializer):
        # only one primary image per product
        instance = self.get_object()
        if self.request.data.get("is_primary")==True:
            ProductImage.objects.filter(product=instance.product).update(is_primary=false)
        serializer.save()

# vendor order view

class VendorOrderView(APIView):
    permission_classes = [IsAuthenticated,IsVendor]
    
    def get(self,request):
        vendor = request.user.vendor_profile
        order_item = OrderItem.objects.filter(vendor=vendor).select_related('order','product').order_by('-id')
        serializer = VendorOrderSerializer(order_item,many=True,context={"request":request})
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def patch(self,request,pk):
        vendor = request.user.vendor_profile 
        try:
            order_item = OrderItem.objects.get(id=pk,vendor=vendor)
        except OrderItem.DoesNotExist:
            return Response(
                {"error":"Order not found or unauthorized"},
                status=status.HTTP_404_NOT_FOUND
            )
        new_status = request.data.get("status")
        allowed_status = ["ACCEPTED","PACKED","SHIPPED","DELIVERD","CANCELLED"]
        
        if new_status not in allowed_status:
            return Response(
                {"error":"Invalid status value"},
                status=status.HTTP_400_BAD_REQUEST
                
            )
        order_item.status = new_status
        order_item.save()
        
        return Response(
            {
                "message":"Order status updated successfully",
                "new_status":new_status
            }, status=status.HTTP_200_OK
        )
        
        
# pagination for optimization
class HomeProductPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
# for all users 

class ProductListView(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Product.objects.filter(is_active=True).select_related('vendor','category').prefetch_related('images').order_by('-id')
    serializer_class = ProductSerializer
    pagination_class = HomeProductPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'vendor__shop_name', 'category__name']
    ordering_fields = ['price', 'created_at']
    filterset_fields = {
        'category':['exact'],
        'price':['gte','lte'],
    }
    
   
   
# add carts items
class CartView(APIView):
    permission_classes = [IsAuthenticated,IsCustomer]
    
    def get(self,request):
        customer = request.user.customer_profile
        cart,created = Cart.objects.get_or_create(customer=customer)
        serializer = CartSerializer(cart)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def post(self,request):
        customer = request.user.customer_profile
        cart,created = Cart.objects.get_or_create(customer=customer)
        data = request.data.copy()
        # handling duplicate carts items
        product = Product.objects.get(id=data['product_id'])
        existing_item = CartItem.objects.filter(cart=cart,product=product).first()
        
        if existing_item:
            existing_item.quantity += int(data['quantity'])
            existing_item.save()
            return Response(CartItemSerializer(existing_item).data,status=status.HTTP_200_OK)
        
        # create new cart item
        data['cart_id'] = cart.id
        serializer = CartItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
            
    def patch(self,request,pk):
        customer = request.user.customer_profile
        cart = get_object_or_404(Cart,customer=customer)
        cart_item = get_object_or_404(CartItem,pk=pk,cart=cart)
        data = request.data.copy()
        
       
        serializer = CartItemSerializer(cart_item,data=data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        customer = request.user.customer_profile
        cart = get_object_or_404(Cart,customer=customer)
        cart_item = get_object_or_404(CartItem,pk=pk,cart=cart)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
      
        
        
      
class OrderView(APIView):
    permission_classes = [IsAuthenticated,IsCustomer]
    
    def get(self,request,pk=None):
        customer = request.user.customer_profile
        
        if pk:
            product = get_object_or_404(OrderItem,pk=pk,order__customer=customer)
            serializer = OrderItemSerializer(product,context={"request":request})
            return Response(serializer.data,status=status.HTTP_200_OK)
        
        products = OrderItem.objects.filter(order__customer=customer).select_related('product','order').order_by('-id')
        serializer = OrderItemSerializer(products,many=True,context={"request":request})
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def post(self,request):
        customer = request.user.customer_profile
        data = request.data.copy()
        
        # handling address for order
        address_id = data.get("address_id")
        if not address_id:
            return Response({"detail":"address_id is required"})
        try:
            address = Address.objects.get(id=address_id,customer=customer)
        except Address.DoesNotExist:
            return Response({"detail":"Invalid address_id"},status=status.HTTP_400_BAD_REQUEST)

        # If items provided in request, create order directly from them
        items_payload = data.get('items')

        if items_payload:
            if not isinstance(items_payload, list) or not items_payload:
                return Response({"detail": "`items` must be a non-empty list."}, status=status.HTTP_400_BAD_REQUEST)

            # Validate and prepare items
            validated = []
            for idx, it in enumerate(items_payload):
                prod_id = it.get('product_id') or it.get('product')
                qty = it.get('quantity')
                if prod_id is None or qty is None:
                    return Response({"detail": f"Each item must include 'product_id' and 'quantity' (item index {idx})."}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    product = Product.objects.get(pk=prod_id)
                except Product.DoesNotExist:
                    return Response({"detail": f"Product with id {prod_id} not found."}, status=status.HTTP_404_NOT_FOUND)
                try:
                    qty = int(qty)
                except Exception:
                    return Response({"detail": f"Quantity must be an integer (item index {idx})."}, status=status.HTTP_400_BAD_REQUEST)
                if qty < 1:
                    return Response({"detail": "Quantity must be at least 1."}, status=status.HTTP_400_BAD_REQUEST)
                if product.stock < qty:
                    return Response({"detail": f"Not enough stock for product '{product.name}' (requested {qty}, available {product.stock})."}, status=status.HTTP_400_BAD_REQUEST)
                validated.append((product, qty))

            # create order and items atomically to ensure consistency
            with transaction.atomic():
                order = Order.objects.create(customer=customer, total_amount=Decimal('0'))
                for product, qty in validated:
                    OrderItem.objects.create(order=order, product=product, quantity=qty, price=product.price)
                # ensure totals are recalculated and saved
                order.update_total()
                # Optionally decrement stock here (commented):
                for product, qty in validated:
                    product.stock = F('stock') - qty
                    product.save()

            # Refresh from DB to get latest related items and totals
            order.refresh_from_db()
            order_serializer = OrderSerializer(order)
            return Response(order_serializer.data, status=status.HTTP_201_CREATED)

        # Otherwise, create order from existing cart
        cart = get_object_or_404(Cart, customer=customer)
        if not cart.items.exists():
            return Response({"detail": "Cart is empty. Provide items to order or add items to cart."}, status=status.HTTP_400_BAD_REQUEST)

        # create order, move items (atomic)
        with transaction.atomic():
            order = Order.objects.create(customer=customer, total_amount=Decimal('0'))
            for item in cart.items.all():
                OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=item.product.price)
            # clear cart items after creating order items
            cart.items.all().delete()
            order.update_total()

        order.refresh_from_db()
        order_serializer = OrderSerializer(order)
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)
    

    def delete(self,request,pk):
        customer = request.user.customer_profile
        order = get_object_or_404(Order,pk=pk,customer=customer)
        
        items = order.items.all()
        if any(item.status != 'PLACED' for item in items):
            return Response({"detail":"only placed orders can be cancelled."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'CANCELLED'
        order.save()
        # updating status of each item 
        for item in items:
            item.status = "CANCELLED"
            item.save()
        return Response({'detail':" Order cancelled successfully."},
                        status=status.HTTP_200_OK)
    
class AdminOrderView(APIView):
    permission_classes = [IsAuthenticated,IsAdminUser]
    
    def patch(self,request,pk):
        order = get_object_or_404(Order,pk=pk)
        data = request.data.copy()
        serializer = OrderSerializer(order,data=data,partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
            
                
class CustomerAddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated,IsCustomer]
    
    def get_queryset(self):
        customer = self.request.user.customer_profile
        return Address.objects.filter(customer=customer,is_default=True)
    
    def perform_create(self,serializer):
        serializer.save(customer = self.request.user.customer_profile)
        
    def destroy(self,request,*args,**kwargs):
        instance = self.get_object()
        instance.is_default = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# vendor dashboard view 
class VendorDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsVendor]

    def get(self, request):
        vendor = request.user.vendor_profile

        # Stats based on OrderItems (NOT vendor on OrderItem)
        total_products = Product.objects.filter(vendor=vendor).count()
        total_orders = OrderItem.objects.filter(vendor=vendor).count()
        pending_orders = OrderItem.objects.filter(vendor=vendor).exclude(status__in=["DELIVERD","CANCELLED"]).count()
        completed_orders = OrderItem.objects.filter(vendor=vendor, status="DELIVERD").count()

        stats = {
            "total_products": total_products,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
        }

        # Recent products with images
        recent_products = Product.objects.filter(
            vendor=vendor
        ).prefetch_related("images").order_by("-created_at")[:5]

        recent_products_data = ProductSerializer(
            recent_products, many=True, context={"request": request}
        ).data

        # Recent orders (correct relationship)
        recent_orders = OrderItem.objects.filter(
            product__vendor=vendor
        ).select_related("order", "product").order_by("-id")[:5]

        recent_orders_data = OrderItemSerializer(
            recent_orders, many=True, context={"request": request}
        ).data
        
        pending_orders =OrderItem.objects.filter(
            product__vendor=vendor
        
        ).exclude(status__in=["DELIVERD","CANCELLED"]).select_related("order","product").order_by("-id")[:5]
        
        pending_orders_data = OrderItemSerializer(
            pending_orders,many=True,context={"request":request}
        ).data
        
        completed_orders = OrderItem.objects.filter(
            product__vendor=vendor,
            status="DELIVERD"
        ).select_related("order","product").order_by("-id")[:5]
        
        completed_orders_data = OrderItemSerializer(
            completed_orders,many=True,context={"request":request}
        ).data

        return Response({
            "stats": stats,
            "recent_products": recent_products_data,
            "recent_orders": recent_orders_data,
            "pending_orders":pending_orders_data,
            "completed_orders":completed_orders_data,
        })


        
# category viewset 
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []   
        
       

    