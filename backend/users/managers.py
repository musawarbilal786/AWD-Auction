from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()

        return user


    def create_superuser(self, email, password=None, **extra_fields):
        from users.models import Role

        extra_fields.setdefault("is_staff", 1)
        extra_fields.setdefault("is_superuser", 1)
        extra_fields.setdefault("status", 1)

        role, created = Role.objects.get_or_create(name="SUPER_ADMIN", defaults={"status": 1})
        extra_fields.setdefault("role_id", role.id)

        if extra_fields.get("is_staff") != 1:
            raise ValueError("Superuser must have is_staff=1.")
        if extra_fields.get("is_superuser") != 1:
            raise ValueError("Superuser must have is_superuser=1.")

        return self.create_user(email, password, **extra_fields)
