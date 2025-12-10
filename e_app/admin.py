from django.contrib import admin
from .models import (User,Vendor,Customer,ProductImage,Cart,Category,CartItem,Product,Order,OrderItem,Payment,Address)
# Register your models here.
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1 
    
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1 
    # readonly_fields = ('price',)

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username','email','role','is_staff','is_active')
    list_filter = ('role','is_active','is_staff')
    search_fields = ('username','email')

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('shop_name','user','is_active','created_at')
    list_filter = ('is_active',)
    search_fields = ('shop_name','user__username') 
    prepopulated_fields = {'slug':('shop_name',)}
    
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('user','phone','is_active','created_at')
    list_filter = ('is_active',)
    search_fields = ('user__username','phone')
    
    
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name','slug','created_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug':('name',)}
    
    
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name','vendor','category','price','stock','status','is_active')
    list_filter = ('status','vendor','category')
    search_fields = ('name', 'vendor__shop_name')
    prepopulated_fields = {'slug':('name',)}
    inlines = [ProductImageInline]
    
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('customer','created_at')
    inlines = [CartItemInline]
    
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id','customer','total_amount','status','created_at')
    list_filter = ('status',)
    search_fields = ('customer__user__username',)
    inlines = [OrderItemInline]
    
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order','payment_id','method','status','created_at')
    list_filter = ('status','method')
    search_fields = ('payment_id',)
    
@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('customer','line','city','state','pincode','is_default')
    list_filter = ('is_default','city','state')
    search_fields = ('customer__user__username','line')
    
    