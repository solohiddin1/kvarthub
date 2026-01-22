import multiprocessing

# Django WSGI application
wsgi_app = "kvarthub.wsgi:application"

# Server socket
bind = "127.0.0.1:8000"

# Workers
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
threads = 2

# Timeouts
timeout = 60
graceful_timeout = 30
keepalive = 5

# Logging
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"

# Security / stability
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190

# Reload (disable in production)
reload = False

# User / group (important!)
user = "www-data"
group = "www-data"

# Environment variables (optional)
raw_env = [
    "DJANGO_SETTINGS_MODULE=kvarthub.settings",
]
