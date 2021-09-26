install:
	pip install -e .
	cd client; npm install
format:
	autopep8 . -r -i
	black . -l 79
test:
	pytest policyengine_core/tests -vv