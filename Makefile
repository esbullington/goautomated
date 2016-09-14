TARGET_IP=104.236.70.158
TARGET_USER=root
SITE=goautomated.biz

.PHONY: build watch

build:
	./node_modules/.bin/gulp build


watch:
	./node_modules/.bin/gulp watch


deploy:
	make build && scp -r _site/* $(TARGET_USER)@$(TARGET_IP):/var/www/$(SITE)
