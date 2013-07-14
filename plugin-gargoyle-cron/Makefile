include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_cron
PKG_VERSION:=20130714

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-cron
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=Cron for Gargoyle
	MAINTAINER:=Saski
	DEPENDS:=+gargoyle
	PKGARCH:=all
endef

define Package/plugin-gargoyle-cron/description
	Plugin Cron
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-cron/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci set gargoyle.display.connection_cron='Zadania cron'
	uci set gargoyle.scripts.connection_cron='cron.sh'
	uci set gargoyle.connection.cron='700'
	uci commit
fi
endef

define Package/plugin-gargoyle-cron/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.connection_cron
	uci del gargoyle.scripts.connection_cron
	uci del gargoyle.connection.cron
	uci commit
fi
endef


define Package/plugin-gargoyle-cron/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-cron))