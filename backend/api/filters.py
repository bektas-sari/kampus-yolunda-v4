import django_filters
from .models import University, Dormitory, StudentHouse

class UniversityFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name='city', lookup_expr='exact')
    uni_type = django_filters.CharFilter(field_name='uni_type', lookup_expr='exact')

    class Meta:
        model = University
        fields = ['city', 'uni_type']

class DormitoryFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name='city', lookup_expr='exact')
    dorm_type = django_filters.CharFilter(field_name='dorm_type', lookup_expr='exact')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = Dormitory
        fields = ['city', 'dorm_type', 'min_price', 'max_price']

class StudentHouseFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(field_name='city', lookup_expr='exact')
    district = django_filters.CharFilter(field_name='district', lookup_expr='icontains')
    room_count = django_filters.CharFilter(field_name='room_count', lookup_expr='exact')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = StudentHouse
        fields = ['city', 'district', 'room_count', 'min_price', 'max_price']
