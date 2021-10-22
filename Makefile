all: install-client install-server build-client build-server format test
install: install-client install-server
	pip install pytest
build-client:
	cd policyengine-client; npm run build
build-server:
	cd server; rm -rf build/ dist/ policyengine.egg-info; python setup.py sdist bdist_wheel
install-client:
	cd policyengine-client; npm install
install-server:
	pip install -e server
publish-server: server
	twine upload server/dist/* --skip-existing
publish-client:
	cd policyengine-client; npm publish
debug-server:
	FLASK_APP=policyengine/server.py FLASK_DEBUG=1 flask run
debug-client:
	cd policyengine-client; npm start
format:
	autopep8 policyengine -r -i
	black policyengine -l 79
test:
	pytest policyengine/tests -vv
