import os 
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Creates a superuser if it doesn't exist"
    
    def handle(self,*args,**kwargs):
        User = get_user_model()
        username = os.environ.get('SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('SUPERUSER_EMAIL', 'admin@gmail.com')
        password = os.environ.get('SUPERUSER_PASSWORD','chowminmerahai@123')
        
        if not password:
            self.stdout.write(self.style.ERROR('SUPERUSER_PASSWORD not exists'))
            return 
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User {username} already exists'))
            return
        
        
     
        User.objects.create_superuser(username, email, password)
        self.stdout.write(self.style.SUCCESS(f'Superuser {username} created successfully'))
        
        
    


