from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    
    def ready(self):
        """
        Import signals when the app is ready.
        This ensures the post_save signal for StudentProfile is registered.
        """
        import accounts.signals
