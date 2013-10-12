include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_hdidle
PKG_VERSION:=20131012

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-hdidle
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=Hd-Idle for Gargoyle
	MAINTAINER:=Saski
	DEPENDS:=+libc +gargoyle +hd-idle
	PKGARCH:=all
endef

define Package/plugin-gargoyle-hdidle/description
	Plugin Hd-Idle
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-hdidle/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="Hd-Idle"
	[ -n `which i18n` ] && {
		menu_name=$$(i18n-menu gargoyle.display.system_hdidle)
	}
	uci set gargoyle.display.system_hdidle="$$menu_name"
	uci set gargoyle.scripts.system_hdidle='hdidle.sh'
	uci set gargoyle.system.hdidle='315'
	uci commit
fi
endef

define Package/plugin-gargoyle-hdidle/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_hdidle
	uci del gargoyle.scripts.system_hdidle
	uci del gargoyle.system.hdidle
	uci commit
fi
endef


define Package/plugin-gargoyle-hdidle/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-hdidle))