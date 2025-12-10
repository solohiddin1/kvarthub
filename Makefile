runserver:
	python manage.py runserver

runserver2:
	python manage.py runserver 8001

mig:
	python manage.py makemigrations & python manage.py migrate

admin:
	python manage.py createsuperuser

static:
	python manage.py collectstatic

regions:
	python manage.py loaddata apps/shared/fixtures/regions.json

districts:
	python manage.py loaddata apps/shared/fixtures/districts.json