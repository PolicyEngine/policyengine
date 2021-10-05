all: install-client install-server build-client build-server format test
build-client:
	cd client/policyengine-core; npm run build
build-server:
	cd server; rm -rf build/ dist/ PolicyEngine_Core.egg-info; python setup.py sdist bdist_wheel
install-client:
	cd client/policyengine-core; npm install
install-server:
	pip install -e server
publish-server: server
	twine upload server/dist/* --skip-existing
publish-client:
	cd client/policyengine-core; npm publish
format:
	autopep8 . -r -i
	black . -l 79
test:
	pytest server/policyengine_core/tests -vv
