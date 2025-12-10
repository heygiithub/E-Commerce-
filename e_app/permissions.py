from rest_framework import permissions

class IsVendor(permissions.BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.role == 'vendor'
    

class IsCustomer(permissions.BasePermission):
    def has_permission(self,request,view):
        return request.user.is_authenticated and request.user.role == "customer"