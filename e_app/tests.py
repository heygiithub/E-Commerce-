from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status


# Create your tests here.
class TestUserRegisration(APITestCase):
    def test_register_user(self):
        url = reverse('register/customer')
        data = {
            "username":"testuser",
            "email": "test@gmail.com",
            "password":"Test@123"
        }
        response = self.client.post(url,data)
        self.assertEqual(response.status_code,status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'],data['username'])
        