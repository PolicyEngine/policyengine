all: install build-client build-server format test
install: install-client install-server
	pip install pytest
build-client:
	cd policyengine-client; npm run build
build-server:
	rm -rf build/ dist/ policyengine.egg-info; python setup.py sdist bdist_wheel
install-client:
	cd policyengine-client; npm install
install-server:
	pip install -e .
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
datasets:
	openfisca-uk-setup --set-default frs_was_imp
	openfisca-uk-data frs_was_imp download 2019
openfisca_uk:
	git clone https://github.com/PolicyEngine/openfisca-uk --depth 1
	cd openfisca-uk; make install
	openfisca-uk-setup --set-default frs_was_imp
	cp -r openfisca-uk/openfisca_uk openfisca_uk
	rm -rf openfisca-uk
openfisca_uk_data:
	git clone https://github.com/ubicenter/openfisca-uk-data --depth 1
	cd openfisca-uk-data; pip install -e .
	openfisca-uk-data frs_was_imp download 2019
	cp -r openfisca-uk-data/openfisca_uk_data/ openfisca_uk_data
	rm -rf openfisca-uk-data
deploy: openfisca_uk_data openfisca_uk test
	rm -rf policyengine/static
	cd policyengine-client; npm run build
	cp -r policyengine-client/build policyengine/static
	y | gcloud app deploy
test-deploy: openfisca_uk_data openfisca_uk test
	rm -rf policyengine/static
	cd policyengine-client; npm run build
	cp -r policyengine-client/build policyengine/static
monitor:
	python policyengine/monitoring/api_monitoring.py
