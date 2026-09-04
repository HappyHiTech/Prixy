PROJECT_ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST)))../../..)

build-DbHealthFunction:
	cp -r ./* $(ARTIFACTS_DIR)
	cp -r $(PROJECT_ROOT)/shared $(ARTIFACTS_DIR)/shared
	cd $(ARTIFACTS_DIR) && npm install --omit=dev