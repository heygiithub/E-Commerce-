from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from decimal import Decimal
from phonenumber_field.modelfields import PhoneNumberField
# Base Abstract model 

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now= True)
    
    class Meta:
        abstract = True  


# user,vendor,customer 

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('vendor','Vendor'),
        ('customer','Customer'),
    )
    
    role = models.CharField(max_length=20,choices=ROLE_CHOICES,default='customer')
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    
class Vendor(BaseModel):
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name='vendor_profile')
    shop_name = models.CharField(max_length=200,unique=True)
    slug = models.SlugField(max_length=200,unique=True,blank=True)
    description = models.TextField(blank=True,null=True)
    is_active = models.BooleanField(default=True)
    
    def save(self,*args,**kwargs):
        if not self.slug:
            self.slug = slugify(self.shop_name)
        super().save(*args,**kwargs)
            
    def __str__(self):
        return self.shop_name
    
    class Meta:
        indexes = [models.Index(fields=['slug'])]
        
        
class Customer(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='customer_profile')
    phone = PhoneNumberField(blank=True,null=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.user.username
    
# category

class Category(BaseModel):
    name = models.CharField(max_length=100,unique=True)
    slug = models.SlugField(max_length=100,unique=True,blank=True)
    
    def save(self,*args,**kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args,**kwargs)
    
    def __str__(self):
        return self.name
    
    # this is very imp for optimazation 
    class Meta:
        indexes = [models.Index(fields=['slug'])]
    

# product 

PRODUCT_STATUS = (
    ('active','Active'),
    ('out_of_stock','Out of Stock'),
    ('inactive','Inactive'),
)

class Product(BaseModel):
    vendor = models.ForeignKey(Vendor,on_delete=models.CASCADE,related_name='products')
    category = models.ForeignKey(Category,on_delete=models.SET_NULL,null=True,blank=True)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255,unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10,decimal_places=2)
    stock = models.PositiveIntegerField()
    status = models.CharField(max_length=20,choices=PRODUCT_STATUS,default='active')
    is_active = models.BooleanField(default=True)
    
    def save(self,*args,**kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1 
            # 2 vendors can have same product slug field this will make sure they will not duplicates 
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug           
        super().save(*args,**kwargs)
        
    def __str__(self):
        return f"{self.name} ({self.vendor.shop_name})"
    
    class Meta:
        indexes = [models.Index(fields=['slug'])]
        
# ProductImage
class ProductImage(BaseModel):
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name="images")
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Image of {self.product.name}"


# Cart

class Cart(BaseModel):
    customer = models.OneToOneField(Customer,on_delete=models.CASCADE,related_name="cart")
    
    def total_price(self):
        return sum((item.subtotal() for item in self.items.all()),Decimal('0'))
    
    def __str__(self):
        return f"Cart of {self.customer.user.username}"
    

# cartItem
class CartItem(BaseModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = ('cart','product')
    
    def subtotal(self):
        return self.product.price * self.quantity
    
    def __str__(self):
        return f"{self.product.name} X {self.quantity}"
    
    
# Order 
ORDER_STATUS = (
    ('pending','Pending'),
    ('processing','Processing'),
    ('shipped','Shipped'),
    ('delivered','Delivered'),
    ('cancelled','Cancelled'),
)

class Order(BaseModel):
    customer = models.ForeignKey(Customer,on_delete=models.CASCADE,related_name='orders')
    address = models.ForeignKey("Address",on_delete=models.SET_NULL,null=True,blank=True)
    total_amount = models.DecimalField(max_digits=10,decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS,default='pending')
    is_active = models.BooleanField(default=True)
    
    def update_total(self):
        # Calculate the total from related order items and persist using a queryset update
        total = sum((item.subtotal() for item in self.items.all()), Decimal('0'))
        # Update DB directly to avoid triggering save() recursion
        Order.objects.filter(pk=self.pk).update(total_amount=total)
        # Keep instance in sync
        self.total_amount = total
    
    def save(self,*args,**kwargs):
        # Save normally. Do not call update_total() here to avoid recursive saves.
        super().save(*args,**kwargs)
        
    def __str__(self):
        return f"Order #{self.id} - {self.customer.user.username}"
    
# OrderItem
class OrderItem(BaseModel):
    order = models.ForeignKey(Order,on_delete=models.CASCADE,related_name="items")
    product = models.ForeignKey(Product,on_delete=models.CASCADE)
    vendor = models.ForeignKey(Vendor,on_delete=models.CASCADE,null=True,blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10,decimal_places=2)
    status = models.CharField(max_length=20,default="PLACED")
    
    class Meta:
        unique_together = ('order','product')
    

    
    def subtotal(self):
        return self.product.price * self.quantity
    
    def __str__(self):
        return f"{self.product.name} X {self.quantity}"
    
# Payment
PAYMENT_STATUS = (
    ('pending','Pending'),
    ('completed','Completed'),
    ('failed','Failed'),
)

PAYMENT_METHODS = (
    ('upi','UPI'),
    ('card','Card'),
    ('cash','Cash'),
    ('banking','Banking'),
)
class Payment(BaseModel):
    order = models.OneToOneField(Order,on_delete=models.CASCADE,related_name='payment')
    payment_id = models.CharField(max_length=255,unique=True)
    method = models.CharField(max_length=20,choices=PAYMENT_METHODS,default='upi')
    status = models.CharField(max_length=20,choices=PAYMENT_STATUS,default='pending')
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"
    
    
class Address(BaseModel):
    customer = models.ForeignKey(Customer,on_delete=models.CASCADE,related_name="addresses")
    line = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.line}, {self.city}"
    
@receiver(post_save,sender=Customer)
def  create_cart_for_customer(sender,instance,created,**kwargs):
    if created:
        Cart.objects.create(customer= instance)


# Keep order totals in sync when order items change
@receiver(post_save, sender=OrderItem)
def _order_item_saved(sender, instance, created, **kwargs):
    try:
        order = instance.order
        order.update_total()
    except Exception:
        pass


@receiver(post_delete, sender=OrderItem)
def _order_item_deleted(sender, instance, **kwargs):
    # instance.order may not be available after delete, so use order_id
    try:
        order = Order.objects.filter(pk=getattr(instance, 'order_id', None)).first()
        if order:
            order.update_total()
    except Exception:
        pass