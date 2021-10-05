all:
	cd server; rm -rf build/ dist/ PolicyEngine_Core.egg-info; python setup.py sdist bdist_wheel
format:
	autopep8 . -r -i
	black . -l 79
test:
	pytest policyengine_core/tests -vv
