from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib import messages
from djoser.utils import decode_uid

User = get_user_model()

def activate_account(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and user.is_active:
        # User is already active
        return redirect('http://localhost:3000/login?message=already_activated')
    elif user is not None:
        # Activate the user
        user.is_active = True
        user.save()
        return redirect('http://localhost:3000/login?message=activated')
    else:
        # Invalid link
        return redirect('http://localhost:3000/login?message=invalid_link')
