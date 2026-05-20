from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class ChangePasswordView(APIView):
    """
    API endpoint to allow authenticated users to change their password.
    
    POST /api/change-password/
    {
        "old_password": "current_password",
        "new_password": "new_password"
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        # Validate that both fields are provided
        if not old_password or not new_password:
            return Response(
                {'error': 'Both old_password and new_password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify the old password
        if not user.check_password(old_password):
            return Response(
                {'error': 'Incorrect current password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set the new password and save
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password updated successfully.'},
            status=status.HTTP_200_OK
        )
