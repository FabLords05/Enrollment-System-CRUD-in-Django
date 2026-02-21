# backend/__init__.py
import pymysql
from django.db.backends.base.base import BaseDatabaseWrapper

# Trick the version check
pymysql.version_info = (2, 2, 8, "final", 0)
pymysql.install_as_MySQLdb()

# Disable the version support check entirely
BaseDatabaseWrapper.check_database_version_supported = lambda self: None