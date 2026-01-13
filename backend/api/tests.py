from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Dormitory, Feature

class DormitoryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Features
        self.wifi = Feature.objects.create(name='WiFi', icon_code='wifi')
        
        # Dorm 1: Expensive, Istanbul
        self.dorm1 = Dormitory.objects.create(
            name='Luxury Dorm',
            slug='luxury-dorm',
            dorm_type='KARMA',
            city='ISTANBUL',
            district='Besiktas',
            price=25000,
            capacity=100
        )
        self.dorm1.features.add(self.wifi)
        
        # Dorm 2: Cheap, Ankara
        self.dorm2 = Dormitory.objects.create(
            name='Budget Dorm',
            slug='budget-dorm',
            dorm_type='ERKEK',
            city='ANKARA',
            district='Cankaya',
            price=8000,
            capacity=50
        )

    def test_list_dormitories(self):
        """Test listing all dormitories"""
        url = reverse('dorm-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_city(self):
        """Test filtering by city"""
        url = reverse('dorm-list')
        response = self.client.get(url, {'city': 'ISTANBUL'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Luxury Dorm')

    def test_filter_by_price_range(self):
        """Test filtering by price range"""
        url = reverse('dorm-list')
        
        # Filter for cheap dorms (<= 10000)
        response = self.client.get(url, {'max_price': 10000})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Budget Dorm')
        
        # Filter for expensive dorms (>= 20000)
        response = self.client.get(url, {'min_price': 20000})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Luxury Dorm')
        
        # Filter range (5000 - 9000)
        response = self.client.get(url, {'min_price': 5000, 'max_price': 9000})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Budget Dorm')

    def test_search_functionality(self):
        """Test search by name"""
        url = reverse('dorm-list')
        response = self.client.get(url, {'search': 'Luxury'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Luxury Dorm')
