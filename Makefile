all: install build format test
install: install-client install-server
install-client:
	cd policyengine-client; pnpm install
install-server:
	pip install -e .
build: build-client build-server
build-client:
	cd policyengine-client; pnpm run build
	rm -rf policyengine/static
	cp -r policyengine-client/build policyengine/static
build-server:
	rm -rf build/ dist/ policyengine.egg-info; python setup.py sdist bdist_wheel
publish: publish-client publish-server
publish-server: policyengine
	twine upload policyengine/dist/* --skip-existing
publish-client:
	cd policyengine-client; pnpm publish
debug-server:
	POLICYENGINE_DEBUG=1 FLASK_APP=policyengine.server:app FLASK_DEBUG=1 flask run
debug-client:
	cd policyengine-client; pnpm start
format:
	autopep8 policyengine -r -i
	autopep8 setup.py -i
	black policyengine -l 79
	black . -l 79
test:
	pytest policyengine/tests -vv
	python policyengine/monitoring/api_monitoring.py
deploy: build-client
	cat $(GOOGLE_APPLICATION_CREDENTIALS) > .gac.json
	gcloud config set app/cloud_build_timeout 3000
	y | gcloud app deploy
	rm .gac.json
deploy-beta:
	cat $(GOOGLE_APPLICATION_CREDENTIALS) > .gac.json
	gcloud config set app/cloud_build_timeout 3000
	y | gcloud app deploy --version beta --no-promote
	rm .gac.json
test-server:
	pytest policyengine/tests/server/
monitor:
	python policyengine/monitoring/api_monitoring.py
server: install-server test-server
changelog:
	build-changelog changelog.yaml --output changelog.yaml --update-last-date --start-from 1.4.1 --append-file changelog_entry.yaml
	build-changelog changelog.yaml --org PolicyEngine --repo policyengine --output CHANGELOG.md --template .github/changelog_template.md
	bump-version changelog.yaml policyengine-client/package.json policyengine/policyengine.py
	rm changelog_entry.yaml || true
	touch changelog_entry.yaml
documentation:
	jb build docs
