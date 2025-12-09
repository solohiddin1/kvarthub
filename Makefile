runserver:
	python manage.py runserver

runserver2:
	python manage.py runserver 8001

mig:
	python manage.py makemigrations & python manage.py migrate
