from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Serializer for creating a new user, extending Djoser's UserCreateSerializer
class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'email', 'name', 'profile_picture', 'password')

# Serializer for retrieving user details, extending Djoser's UserCreateSerializer
class UserSerializer(BaseUserCreateSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'profile_picture')
