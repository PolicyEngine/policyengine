all: install build format test
install: install-client install-server
install-client:
	cd policyengine-client; npm install
install-server:
	pip install -e .
build: build-client build-server
build-client:
	cd policyengine-client; npm run build
	rm -rf policyengine/static
	cp -r policyengine-client/build policyengine/static
build-server:
	rm -rf build/ dist/ policyengine.egg-info; python setup.py sdist bdist_wheel
publish: publish-client publish-server
publish-server: policyengine
	twine upload policyengine/dist/* --skip-existing
publish-client:
	cd policyengine-client; npm publish
debug-server:
	FLASK_APP=policyengine/server.py FLASK_DEBUG=1 flask run
debug-client:
	cd policyengine-client; npm start
format:
	autopep8 policyengine -r -i
	autopep8 main.py setup.py -i
	black policyengine -l 79
	black . -l 79
test:
	pytest policyengine/tests -vv
	python policyengine/monitoring/api_monitoring.py
deploy: test
	cat $(GOOGLE_APPLICATION_CREDENTIALS) > .gac.json
	gcloud config set app/cloud_build_timeout 1800
	y | gcloud app deploy
	rm .gac.json
test-server:
	pytest policyengine/tests/server/
monitor:
	python policyengine/monitoring/api_monitoring.py
server: install-server test-server
