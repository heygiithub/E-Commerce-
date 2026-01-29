from rest_framework import serializers
from .models import (User,Product,Payment,ProductImage,Order,OrderItem,Address,Cart,CartItem,Category,Customer,Vendor)
from decimal import Decimal
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email','role']

class VendorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only = True)
    
    class Meta:
        model = Vendor
        fields = ['id','user','shop_name','slug','description','is_active']

class VendorOrderSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source = 'product.name',read_only=True)
    customer = serializers.CharField(source = 'order.customer.username',read_only=True)
    order_id = serializers.IntegerField(source='order.id',read_only=True)
    total_amount = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id','order_id','product','customer','quantity','total_amount','status','price','image']
        
    def get_total_amount(self,obj):
        return obj.quantity * obj.product.price
    
    def get_image(self,obj):
        primary_image = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        if primary_image:
            request = self.context.get('request')
            return request.build_absolute_uri(primary_image.image.url)
        return None

class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = ['id','user','phone','is_active']
        
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','name','slug']
        
class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)
    
    class Meta:
        model = ProductImage
        fields = ['id','product','image','is_primary']
        read_only_fields = ['id']
    
    def get_image(self,obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
        
class ProductListSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    class Meta:
        model = Product 
        fields = ['id', 'name','slug', 'price', 'image']
        
    def get_image(self,obj):
        primary_image = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None      

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    vendor = VendorSerializer(read_only=True)
    images = ProductImageSerializer(read_only=True,many=True)
    
    vendor_id = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.all(),source='vendor',write_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(),source='category',write_only=True,required=False,allow_null=True)
    class Meta:
        model = Product
        fields = ['id','vendor','vendor_id','category_id','category','name','slug','description','price','stock','status','is_active','images']
        read_only_fields = ['id','slug','vendor','status','is_active']
        
    # handling img url 
    def to_representation(self,instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and "images" in data:
            for img in data['images']:
                if img.get('image'):
                    img['image']=request.build_absolute_uri(img['image'])
        return data 

    def create(self,validated_data):
        validated_data["vendor"] = self.context["request"].user.vendor_profile
        return super().create(validated_data)
        
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductDetailSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(),source='product',write_only=True)
    cart_id = serializers.PrimaryKeyRelatedField(queryset=Cart.objects.all(),source='cart',write_only=True)
    class Meta:
        model = CartItem
        fields = ['id','product','product_id','cart_id','quantity']
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value
        
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True,read_only = True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id','customer','items','total_price']
        
    def get_total_price(self,obj):
        return sum((item.subtotal() for item in obj.items.all()),Decimal('0'))
            
class AddressSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    
    class Meta:
        model = Address
        fields = ['id','customer','line','city','state','pincode','is_default']
            
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    order_id = serializers.IntegerField(source="order.id",read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id','order_id','product','quantity','price','subtotal','status']
        
    def get_subtotal(self,obj):
        return obj.product.price * obj.quantity
        
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(read_only=True,many=True)
    address = AddressSerializer(read_only=True)
    customer = serializers.StringRelatedField()
    
    class Meta:
        model = Order
        fields = ['id','customer','address','status','total_amount','created_at','items','created_at','updated_at']
        
class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(source="order",queryset=Order.objects.all(),write_only=True)
    class Meta:
        model = Payment
        fields = ['id','order','payment_id','method','status','order_id']
        

        

# VendorRegisterSerializer

class VendorRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only= True)
    shop_name = serializers.CharField()
    description = serializers.CharField(required=False,allow_blank=True)
    
    def validate_username(self,value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def valildate_shop_name(self,value):
        if Vendor.objects.filter(shop_name=value).exits():
            raise serializers.ValidationError("shop name already exists")
        return value
    
    # if anything goes wrong it will rolled over 
    @transaction.atomic
    def create(self,validated_data):
        username = validated_data['username']
        password = validated_data['password']
        email = validated_data['email']
        shop_name = validated_data['shop_name']
        description = validated_data.get("description","")
        
        # create user 
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            role="vendor",
            )
        
        # create vendor profile
        vendor = Vendor.objects.create(
            user = user,
            shop_name = shop_name,
            description = description,
        )
        
        return vendor

# customer registeration

class CustomerRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False,allow_blank=True)
    
    def validate_username(self,value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self,value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value 
    
    @transaction.atomic
    def create(self,validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        phone = validated_data.get('phone','')
        
        # create user with role customer
        user = User.objects.create_user(
            username =username,
            email = email,
            password = password,
            role = 'customer'
        )
        # create customer profile 
        customer =Customer.objects.create(
            user = user,
            phone = phone 
        )
        
        return customer 

# login serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self,data):
        username = data.get("username")
        password = data.get("password")
        if not username  or not password:
            raise serializers.ValidationError("Username and password are required")
        
        user = authenticate(username=username,password=password)
        if user is None:
            raise serializers.ValidationError("Invalid Username or Password")
        
        # find user role
        if Customer.objects.filter(user = user).exists():
            user_role = "customer"
        
        elif Vendor.objects.filter(user=user).exists():
            user_role = "vendor"
        
        else:
            user_role = "unknown" 
        
        # generate token 
        refresh = RefreshToken.for_user(user)
        return {
            
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_role': user_role,
            'username': user.username,
            'id' : user.id
            
        }
        
# creating vendor product serializer 

class VendorProductSerializer(serializers.ModelSerializer):
    vendor = serializers.PrimaryKeyRelatedField(read_only=True)
    images = ProductImageSerializer(many=True,read_only=True)
    class Meta:
        model = Product
        fields = ["id","name","vendor","description","price","stock","category","slug","status","is_active","images","created_at","updated_at"]
        read_only_fields = ["id","slug","status","is_active","vendor","created_at","updated_at"]
        
        
    def create(self,validated_data):
        request = self.context['request']
        vendor = request.user.vendor_profile
        validated_data["vendor"] = vendor
        return super().create(validated_data)
    
    def update(self,instance,validated_data):
        validated_data.pop("vendor",None)
        return super().update(instance,validated_data)
    
    