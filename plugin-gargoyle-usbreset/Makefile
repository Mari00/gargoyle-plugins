include $(TOPDIR)/rules.mk

PKG_NAME:=plugin_gargoyle_usbreset
PKG_VERSION:=20131012

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

define Package/plugin-gargoyle-usbreset
	SECTION:=admin
	CATEGORY:=Administration
	SUBMENU:=Gargoyle Web Interface
	TITLE:=USBreset for Gargoyle
	MAINTAINER:=Saski
	DEPENDS:=+libc +gargoyle +usbreset
	PKGARCH:=all
endef

define Package/plugin-gargoyle-usbreset/description
	Plugin USBreset
endef

define Build/Prepare
endef

define Build/Configure
endef

define Build/Compile
endef

define Package/plugin-gargoyle-usbreset/postinst
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	menu_name="USBreset"
	[ -n `which i18n` ] && {
		mn=$$(i18n-menu gargoyle.display.system_usbreset)
		if [ -n "$$mn" ] ; then
			menu_name="$$mn"
		fi
	}
	uci set gargoyle.display.system_usbreset="$$menu_name"
	uci set gargoyle.scripts.system_usbreset='usbreset.sh'
	uci set gargoyle.system.usbreset='317'
	uci commit
fi
endef

define Package/plugin-gargoyle-usbreset/postrm
#!/bin/sh

if [ -z "$${IPKG_INSTROOT}" ]; then
	uci del gargoyle.display.system_usbreset
	uci del gargoyle.scripts.system_usbreset
	uci del gargoyle.system.usbreset
	uci commit
fi
endef


define Package/plugin-gargoyle-usbreset/install
	$(INSTALL_DIR) $(1)
	$(CP) ./files/* $(1)/
endef

$(eval $(call BuildPackage,plugin-gargoyle-usbreset))