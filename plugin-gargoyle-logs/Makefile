include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_logs
PKG_VERSION:=20131012

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-logs
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=Logs for Gargoyle
	MAINTAINER:=Saski
	DEPENDS:=+libc +gargoyle
	PKGARCH:=all
endef

define Package/plugin-gargoyle-logs/description
	Plugin Logi
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-logs/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci set gargoyle.display.system_logs='Logs'
	uci set gargoyle.scripts.system_logs='logs.sh'
	uci set gargoyle.system.logs='316'
	uci commit
fi
endef

define Package/plugin-gargoyle-logs/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_logs
	uci del gargoyle.scripts.system_logs
	uci del gargoyle.system.logs
	uci commit
fi
endef


define Package/plugin-gargoyle-logs/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-logs))