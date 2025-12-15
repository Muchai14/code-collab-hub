.PHONY: install dev test clean

install:
	pip install -r requirements.txt

dev:
	uvicorn main:app --host 0.0.0.0 --port 3001 --reload

test:
	pytest

clean:
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf tests/__pycache__
