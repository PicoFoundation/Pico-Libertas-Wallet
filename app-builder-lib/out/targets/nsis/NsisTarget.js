"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NsisTarget = void 0;

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

  _bluebirdLst = function () {
    return data;
  };

  return data;
}

function _zipBin() {
  const data = require("7zip-bin");

  _zipBin = function () {
    return data;
  };

  return data;
}

function _builderUtil() {
  const data = require("builder-util");

  _builderUtil = function () {
    return data;
  };

  return data;
}

function _builderUtilRuntime() {
  const data = require("builder-util-runtime");

  _builderUtilRuntime = function () {
    return data;
  };

  return data;
}

function _binDownload() {
  const data = require("../../binDownload");

  _binDownload = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = require("builder-util/out/fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _hash() {
  const data = require("builder-util/out/hash");

  _hash = function () {
    return data;
  };

  return data;
}

var _debug2 = _interopRequireDefault(require("debug"));

function _fsExtraP() {
  const data = require("fs-extra-p");

  _fsExtraP = function () {
    return data;
  };

  return data;
}

function _lazyVal() {
  const data = require("lazy-val");

  _lazyVal = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _core() {
  const data = require("../../core");

  _core = function () {
    return data;
  };

  return data;
}

function _CommonWindowsInstallerConfiguration() {
  const data = require("../../options/CommonWindowsInstallerConfiguration");

  _CommonWindowsInstallerConfiguration = function () {
    return data;
  };

  return data;
}

function _platformPackager() {
  const data = require("../../platformPackager");

  _platformPackager = function () {
    return data;
  };

  return data;
}

function _timer() {
  const data = require("../../util/timer");

  _timer = function () {
    return data;
  };

  return data;
}

function _wine() {
  const data = require("../../wine");

  _wine = function () {
    return data;
  };

  return data;
}

function _archive() {
  const data = require("../archive");

  _archive = function () {
    return data;
  };

  return data;
}

function _differentialUpdateInfoBuilder() {
  const data = require("../differentialUpdateInfoBuilder");

  _differentialUpdateInfoBuilder = function () {
    return data;
  };

  return data;
}

function _targetUtil() {
  const data = require("../targetUtil");

  _targetUtil = function () {
    return data;
  };

  return data;
}

function _nsisLang() {
  const data = require("./nsisLang");

  _nsisLang = function () {
    return data;
  };

  return data;
}

function _nsisLicense() {
  const data = require("./nsisLicense");

  _nsisLicense = function () {
    return data;
  };

  return data;
}

function _nsisScriptGenerator() {
  const data = require("./nsisScriptGenerator");

  _nsisScriptGenerator = function () {
    return data;
  };

  return data;
}

function _nsisUtil() {
  const data = require("./nsisUtil");

  _nsisUtil = function () {
    return data;
  };

  return data;
}

let createPackageFileInfo = (() => {
  var _ref9 = (0, _bluebirdLst().coroutine)(function* (file) {
    return {
      path: file,
      size: (yield (0, _fsExtraP().stat)(file)).size,
      sha512: yield (0, _hash().hashFile)(file)
    };
  });

  return function createPackageFileInfo(_x2) {
    return _ref9.apply(this, arguments);
  };
})(); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const debug = (0, _debug2.default)("electron-builder:nsis"); // noinspection SpellCheckingInspection

const ELECTRON_BUILDER_NS_UUID = _builderUtilRuntime().UUID.parse("50e065bc-3134-11e6-9bab-38c9862bdaf3"); // noinspection SpellCheckingInspection


const nsisResourcePathPromise = new (_lazyVal().Lazy)(() => (0, _binDownload().getBinFromGithub)("nsis-resources", "3.3.0", "4okc98BD0v9xDcSjhPVhAkBMqos+FvD/5/H72fTTIwoHTuWd2WdD7r+1j72hxd+ZXxq1y3FRW0x6Z3jR0VfpMw=="));
const USE_NSIS_BUILT_IN_COMPRESSOR = false;

class NsisTarget extends _core().Target {
  constructor(packager, outDir, targetName, packageHelper) {
    super(targetName);
    this.packager = packager;
    this.outDir = outDir;
    this.packageHelper = packageHelper;
    /** @private */

    this.archs = new Map();
    this.packageHelper.refCount++;
    this.options = targetName === "portable" ? Object.create(null) : Object.assign({}, this.packager.config.nsis, {
      preCompressedFileExtensions: [".avi", ".mov", ".m4v", ".mp4", ".m4p", ".qt", ".mkv", ".webm", ".vmdk"]
    });

    if (targetName !== "nsis") {
      Object.assign(this.options, this.packager.config[targetName === "nsis-web" ? "nsisWeb" : targetName]);
    }

    const deps = packager.info.metadata.dependencies;

    if (deps != null && deps["electron-squirrel-startup"] != null) {
      _builderUtil().log.warn('"electron-squirrel-startup" dependency is not required for NSIS');
    }
  }

  build(appOutDir, arch) {
    var _this = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      _this.archs.set(arch, appOutDir);
    })();
  }

  get isBuildDifferentialAware() {
    return !this.isPortable && this.options.differentialPackage !== false;
  }

  getPreCompressedFileExtensions() {
    const result = this.isWebInstaller ? null : this.options.preCompressedFileExtensions;
    return result == null ? null : (0, _builderUtil().asArray)(result).map(it => it.startsWith(".") ? it : `.${it}`);
  }
  /** @private */


  buildAppPackage(appOutDir, arch) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const options = _this2.options;
      const packager = _this2.packager;
      const isBuildDifferentialAware = _this2.isBuildDifferentialAware;
      const format = !isBuildDifferentialAware && options.useZip ? "zip" : "7z";
      const archiveFile = path.join(_this2.outDir, `${packager.appInfo.sanitizedName}-${packager.appInfo.version}-${_builderUtil().Arch[arch]}.nsis.${format}`);

      const preCompressedFileExtensions = _this2.getPreCompressedFileExtensions();

      const archiveOptions = {
        withoutDir: true,
        compression: packager.compression,
        excluded: preCompressedFileExtensions == null ? null : preCompressedFileExtensions.map(it => `*${it}`)
      };
      const timer = (0, _timer().time)(`nsis package, ${_builderUtil().Arch[arch]}`);
      yield (0, _archive().archive)(format, archiveFile, appOutDir, isBuildDifferentialAware ? (0, _differentialUpdateInfoBuilder().configureDifferentialAwareArchiveOptions)(archiveOptions) : archiveOptions);
      timer.end();

      if (isBuildDifferentialAware && _this2.isWebInstaller) {
        const data = yield (0, _differentialUpdateInfoBuilder().appendBlockmap)(archiveFile);
        return Object.assign({}, data, {
          size: data.size,
          path: archiveFile
        });
      } else {
        return yield createPackageFileInfo(archiveFile);
      }
    })();
  }

  finishBuild() {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      try {
        yield _this3.buildInstaller();
      } finally {
        yield _this3.packageHelper.finishBuild();
      }
    })();
  }

  get installerFilenamePattern() {
    // tslint:disable:no-invalid-template-strings
    return "${productName} " + (this.isPortable ? "" : "Setup ") + "${version}.${ext}";
  }

  get isPortable() {
    return this.name === "portable";
  }

  buildInstaller() {
    var _this4 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this4.packager;
      const appInfo = packager.appInfo;
      const options = _this4.options;
      const installerFilename = packager.expandArtifactNamePattern(options, "exe", null, _this4.installerFilenamePattern);
      const oneClick = options.oneClick !== false;
      const installerPath = path.join(_this4.outDir, installerFilename);
      const logFields = {
        target: _this4.name,
        file: _builderUtil().log.filePath(installerPath),
        archs: Array.from(_this4.archs.keys()).map(it => _builderUtil().Arch[it]).join(", ")
      };

      if (!_this4.isPortable) {
        logFields.oneClick = oneClick;
      }

      _builderUtil().log.info(logFields, "building");

      const guid = options.guid || _builderUtilRuntime().UUID.v5(appInfo.id, ELECTRON_BUILDER_NS_UUID);

      const uninstallAppKey = guid.replace(/\\/g, " - ");
      const defines = {
        APP_ID: appInfo.id,
        APP_GUID: guid,
        // Windows bug - entry in Software\Microsoft\Windows\CurrentVersion\Uninstall cannot have \ symbols (dir)
        UNINSTALL_APP_KEY: uninstallAppKey,
        PRODUCT_NAME: appInfo.productName,
        PRODUCT_FILENAME: appInfo.productFilename,
        APP_FILENAME: (0, _targetUtil().getWindowsInstallationDirName)(appInfo, !oneClick || options.perMachine === true),
        APP_DESCRIPTION: appInfo.description,
        VERSION: appInfo.version,
        PROJECT_DIR: packager.projectDir,
        BUILD_RESOURCES_DIR: packager.info.buildResourcesDir
      };

      if (uninstallAppKey !== guid) {
        defines.UNINSTALL_REGISTRY_KEY_2 = `Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${guid}`;
      }

      const commands = {
        OutFile: `"${installerPath}"`,
        VIProductVersion: appInfo.getVersionInWeirdWindowsForm(),
        VIAddVersionKey: _this4.computeVersionKey(),
        Unicode: _this4.isUnicodeEnabled
      };
      const isPortable = _this4.isPortable;
      const iconPath = (isPortable ? null : yield packager.getResource(options.installerIcon, "installerIcon.ico")) || (yield packager.getIconPath());

      if (iconPath != null) {
        if (isPortable) {
          commands.Icon = `"${iconPath}"`;
        } else {
          defines.MUI_ICON = iconPath;
          defines.MUI_UNICON = iconPath;
        }
      }

      const packageFiles = {};
      let estimatedSize = 0;

      if (_this4.isPortable && options.useZip) {
        for (const [arch, dir] of _this4.archs.entries()) {
          defines[arch === _builderUtil().Arch.x64 ? "APP_DIR_64" : "APP_DIR_32"] = dir;
        }
      } else if (USE_NSIS_BUILT_IN_COMPRESSOR && _this4.archs.size === 1) {
        defines.APP_BUILD_DIR = _this4.archs.get(_this4.archs.keys().next().value);
      } else {
        yield _bluebirdLst().default.map(_this4.archs.keys(), (() => {
          var _ref = (0, _bluebirdLst().coroutine)(function* (arch) {
            const fileInfo = yield _this4.packageHelper.packArch(arch, _this4);
            const file = fileInfo.path;
            const defineKey = arch === _builderUtil().Arch.x64 ? "APP_64" : "APP_32";
            defines[defineKey] = file;
            defines[`${defineKey}_NAME`] = path.basename(file); // nsis expect a hexadecimal string

            defines[`${defineKey}_HASH`] = Buffer.from(fileInfo.sha512, "base64").toString("hex").toUpperCase();

            if (_this4.isWebInstaller) {
              packager.dispatchArtifactCreated(file, _this4, arch);
              packageFiles[_builderUtil().Arch[arch]] = fileInfo;
            }

            const archiveInfo = (yield (0, _builderUtil().exec)(_zipBin().path7za, ["l", file])).trim(); // after adding blockmap data will be "Warnings: 1" in the end of output

            const match = archiveInfo.match(/(\d+)\s+\d+\s+\d+\s+files/);

            if (match == null) {
              _builderUtil().log.warn({
                output: archiveInfo
              }, "cannot compute size of app package");
            } else {
              estimatedSize += parseInt(match[1], 10);
            }
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })());
      }

      _this4.configureDefinesForAllTypeOfInstaller(defines);

      if (isPortable) {
        defines.REQUEST_EXECUTION_LEVEL = options.requestExecutionLevel || "user";
      } else {
        yield _this4.configureDefines(oneClick, defines);
      }

      if (estimatedSize !== 0) {
        // in kb
        defines.ESTIMATED_SIZE = Math.round(estimatedSize / 1024);
      }

      if (packager.compression === "store") {
        commands.SetCompress = "off";
      } else {
        // difference - 33.540 vs 33.601, only 61 KB (but zip is faster to decompress)
        // do not use /SOLID - "With solid compression, files are uncompressed to temporary file before they are copied to their final destination",
        // it is not good for portable installer (where built-in NSIS compression is used). http://forums.winamp.com/showpost.php?p=2982902&postcount=6
        commands.SetCompressor = "zlib";

        if (!_this4.isWebInstaller) {
          defines.COMPRESS = "auto";
        }
      }

      debug(defines);
      debug(commands);

      if (packager.packagerOptions.effectiveOptionComputed != null && (yield packager.packagerOptions.effectiveOptionComputed([defines, commands]))) {
        return;
      }

      const sharedHeader = yield _this4.computeCommonInstallerScriptHeader();
      const script = isPortable ? yield (0, _fsExtraP().readFile)(path.join(_nsisUtil().nsisTemplatesDir, "portable.nsi"), "utf8") : yield _this4.computeScriptAndSignUninstaller(defines, commands, installerPath, sharedHeader);
      yield _this4.executeMakensis(defines, commands, sharedHeader + (yield _this4.computeFinalScript(script, true)));
      yield Promise.all([packager.sign(installerPath), defines.UNINSTALLER_OUT_FILE == null ? Promise.resolve() : (0, _fsExtraP().unlink)(defines.UNINSTALLER_OUT_FILE)]);
      const safeArtifactName = (0, _platformPackager().isSafeGithubName)(installerFilename) ? installerFilename : _this4.generateGitHubInstallerName();
      let updateInfo;

      if (_this4.isWebInstaller) {
        updateInfo = (0, _differentialUpdateInfoBuilder().createNsisWebDifferentialUpdateInfo)(installerPath, packageFiles);
      } else if (_this4.isBuildDifferentialAware) {
        updateInfo = yield (0, _differentialUpdateInfoBuilder().createBlockmap)(installerPath, _this4, packager, safeArtifactName);
      }

      packager.info.dispatchArtifactCreated({
        file: installerPath,
        updateInfo,
        target: _this4,
        packager,
        arch: _this4.archs.size === 1 ? _this4.archs.keys().next().value : null,
        safeArtifactName,
        isWriteUpdateInfo: !_this4.isPortable
      });
    })();
  }

  generateGitHubInstallerName() {
    const appInfo = this.packager.appInfo;
    const classifier = appInfo.name.toLowerCase() === appInfo.name ? "setup-" : "Setup-";
    return `${appInfo.name}-${this.isPortable ? "" : classifier}${appInfo.version}.exe`;
  }

  get isUnicodeEnabled() {
    return this.options.unicode !== false;
  }

  get isWebInstaller() {
    return false;
  }

  computeScriptAndSignUninstaller(defines, commands, installerPath, sharedHeader) {
    var _this5 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this5.packager;
      const customScriptPath = yield packager.getResource(_this5.options.script, "installer.nsi");
      const script = yield (0, _fsExtraP().readFile)(customScriptPath || path.join(_nsisUtil().nsisTemplatesDir, "installer.nsi"), "utf8");

      if (customScriptPath != null) {
        _builderUtil().log.info({
          reason: "custom NSIS script is used"
        }, "uninstaller is not signed by electron-builder");

        return script;
      } // https://github.com/electron-userland/electron-builder/issues/2103
      // it is more safe and reliable to write uninstaller to our out dir


      const uninstallerPath = path.join(_this5.outDir, `.__uninstaller-${_this5.name}-${_this5.packager.appInfo.sanitizedName}.exe`);
      const isWin = process.platform === "win32";
      defines.BUILD_UNINSTALLER = null;
      defines.UNINSTALLER_OUT_FILE = isWin ? uninstallerPath : path.win32.join("Z:", uninstallerPath);
      yield _this5.executeMakensis(defines, commands, sharedHeader + (yield _this5.computeFinalScript(script, false)));
      yield (0, _wine().execWine)(installerPath, []);
      yield packager.sign(uninstallerPath, "  Signing NSIS uninstaller");
      delete defines.BUILD_UNINSTALLER; // platform-specific path, not wine

      defines.UNINSTALLER_OUT_FILE = uninstallerPath;
      return script;
    })();
  }

  computeVersionKey() {
    // Error: invalid VIProductVersion format, should be X.X.X.X
    // so, we must strip beta
    const localeId = this.options.language || "1033";
    const appInfo = this.packager.appInfo;
    const versionKey = [`/LANG=${localeId} ProductName "${appInfo.productName}"`, `/LANG=${localeId} ProductVersion "${appInfo.version}"`, `/LANG=${localeId} LegalCopyright "${appInfo.copyright}"`, `/LANG=${localeId} FileDescription "${appInfo.description}"`, `/LANG=${localeId} FileVersion "${appInfo.buildVersion}"`];
    (0, _builderUtil().use)(this.packager.platformSpecificBuildOptions.legalTrademarks, it => versionKey.push(`/LANG=${localeId} LegalTrademarks "${it}"`));
    (0, _builderUtil().use)(appInfo.companyName, it => versionKey.push(`/LANG=${localeId} CompanyName "${it}"`));
    return versionKey;
  }

  configureDefines(oneClick, defines) {
    const packager = this.packager;
    const options = this.options;
    const asyncTaskManager = new (_builderUtil().AsyncTaskManager)(packager.info.cancellationToken);

    if (oneClick) {
      defines.ONE_CLICK = null;

      if (options.runAfterFinish !== false) {
        defines.RUN_AFTER_FINISH = null;
      }

      asyncTaskManager.add((0, _bluebirdLst().coroutine)(function* () {
        const installerHeaderIcon = yield packager.getResource(options.installerHeaderIcon, "installerHeaderIcon.ico");

        if (installerHeaderIcon != null) {
          defines.HEADER_ICO = installerHeaderIcon;
        }
      }));
    } else {
      if (options.runAfterFinish === false) {
        defines.HIDE_RUN_AFTER_FINISH = null;
      }

      asyncTaskManager.add((0, _bluebirdLst().coroutine)(function* () {
        const installerHeader = yield packager.getResource(options.installerHeader, "installerHeader.bmp");

        if (installerHeader != null) {
          defines.MUI_HEADERIMAGE = null;
          defines.MUI_HEADERIMAGE_RIGHT = null;
          defines.MUI_HEADERIMAGE_BITMAP = installerHeader;
        }
      }));
      asyncTaskManager.add((0, _bluebirdLst().coroutine)(function* () {
        const bitmap = (yield packager.getResource(options.installerSidebar, "installerSidebar.bmp")) || "${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp";
        defines.MUI_WELCOMEFINISHPAGE_BITMAP = bitmap;
        defines.MUI_UNWELCOMEFINISHPAGE_BITMAP = (yield packager.getResource(options.uninstallerSidebar, "uninstallerSidebar.bmp")) || bitmap;
      }));

      if (options.allowElevation !== false) {
        defines.MULTIUSER_INSTALLMODE_ALLOW_ELEVATION = null;
      }
    }

    if (options.perMachine === true) {
      defines.INSTALL_MODE_PER_ALL_USERS = null;
    }

    if (!oneClick || options.perMachine === true) {
      defines.INSTALL_MODE_PER_ALL_USERS_REQUIRED = null;
    }

    if (options.allowToChangeInstallationDirectory) {
      if (oneClick) {
        throw new (_builderUtil().InvalidConfigurationError)("allowToChangeInstallationDirectory makes sense only for assisted installer (please set oneClick to false)");
      }

      defines.allowToChangeInstallationDirectory = null;
    }

    const commonOptions = (0, _CommonWindowsInstallerConfiguration().getEffectiveOptions)(options, packager);

    if (commonOptions.menuCategory != null) {
      defines.MENU_FILENAME = commonOptions.menuCategory;
    }

    defines.SHORTCUT_NAME = commonOptions.shortcutName;

    if (options.deleteAppDataOnUninstall) {
      defines.DELETE_APP_DATA_ON_UNINSTALL = null;
    }

    asyncTaskManager.add((0, _bluebirdLst().coroutine)(function* () {
      const uninstallerIcon = yield packager.getResource(options.uninstallerIcon, "uninstallerIcon.ico");

      if (uninstallerIcon != null) {
        // we don't need to copy MUI_UNICON (defaults to app icon), so, we have 2 defines
        defines.UNINSTALLER_ICON = uninstallerIcon;
        defines.MUI_UNICON = uninstallerIcon;
      }
    }));
    defines.UNINSTALL_DISPLAY_NAME = packager.expandMacro(options.uninstallDisplayName || "${productName} ${version}", null, {}, false);

    if (commonOptions.isCreateDesktopShortcut === _CommonWindowsInstallerConfiguration().DesktopShortcutCreationPolicy.NEVER) {
      defines.DO_NOT_CREATE_DESKTOP_SHORTCUT = null;
    }

    if (commonOptions.isCreateDesktopShortcut === _CommonWindowsInstallerConfiguration().DesktopShortcutCreationPolicy.ALWAYS) {
      defines.RECREATE_DESKTOP_SHORTCUT = null;
    }

    if (!commonOptions.isCreateStartMenuShortcut) {
      defines.DO_NOT_CREATE_START_MENU_SHORTCUT = null;
    }

    if (options.displayLanguageSelector === true) {
      defines.DISPLAY_LANG_SELECTOR = null;
    }

    return asyncTaskManager.awaitTasks();
  }

  configureDefinesForAllTypeOfInstaller(defines) {
    const appInfo = this.packager.appInfo;
    const companyName = appInfo.companyName;

    if (companyName != null) {
      defines.COMPANY_NAME = companyName;
    } // electron uses product file name as app data, define it as well to remove on uninstall


    if (defines.APP_FILENAME !== appInfo.productFilename) {
      defines.APP_PRODUCT_FILENAME = appInfo.productFilename;
    }

    if (this.isWebInstaller) {
      defines.APP_PACKAGE_STORE_FILE = `${appInfo.productFilename}\\${_builderUtilRuntime().CURRENT_APP_PACKAGE_FILE_NAME}`;
    } else {
      defines.APP_INSTALLER_STORE_FILE = `${appInfo.productFilename}\\${_builderUtilRuntime().CURRENT_APP_INSTALLER_FILE_NAME}`;
    }

    if (!this.isWebInstaller && defines.APP_BUILD_DIR == null) {
      const options = this.options;

      if (options.useZip) {
        defines.ZIP_COMPRESSION = null;
      }

      defines.COMPRESSION_METHOD = options.useZip ? "zip" : "7z";
    }
  }

  executeMakensis(defines, commands, script) {
    var _this6 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const args = _this6.options.warningsAsErrors === false ? [] : ["-WX"];

      for (const name of Object.keys(defines)) {
        const value = defines[name];

        if (value == null) {
          args.push(`-D${name}`);
        } else {
          args.push(`-D${name}=${value}`);
        }
      }

      for (const name of Object.keys(commands)) {
        const value = commands[name];

        if (Array.isArray(value)) {
          for (const c of value) {
            args.push(`-X${name} ${c}`);
          }
        } else {
          args.push(`-X${name} ${value}`);
        }
      }

      args.push("-");

      if (_this6.packager.debugLogger.isEnabled) {
        _this6.packager.debugLogger.add("nsis.script", script);
      }

      const nsisPath = yield _nsisUtil().NSIS_PATH.value;
      const command = path.join(nsisPath, process.platform === "darwin" ? "mac" : process.platform === "win32" ? "Bin" : "linux", process.platform === "win32" ? "makensis.exe" : "makensis");
      yield (0, _builderUtil().spawnAndWrite)(command, args, script, {
        // we use NSIS_CONFIG_CONST_DATA_PATH=no to build makensis on Linux, but in any case it doesn't use stubs as MacOS/Windows version, so, we explicitly set NSISDIR
        env: Object.assign({}, process.env, {
          NSISDIR: nsisPath
        }),
        cwd: _nsisUtil().nsisTemplatesDir
      });
    })();
  }

  computeCommonInstallerScriptHeader() {
    var _this7 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this7.packager;
      const options = _this7.options;
      const scriptGenerator = new (_nsisScriptGenerator().NsisScriptGenerator)();
      const langConfigurator = new (_nsisLang().LangConfigurator)(options);
      scriptGenerator.include(path.join(_nsisUtil().nsisTemplatesDir, "include", "StdUtils.nsh"));
      const includeDir = path.join(_nsisUtil().nsisTemplatesDir, "include");
      scriptGenerator.addIncludeDir(includeDir);
      scriptGenerator.flags(["updated", "force-run", "keep-shortcuts", "no-desktop-shortcut", "delete-app-data"]);
      (0, _nsisLang().createAddLangsMacro)(scriptGenerator, langConfigurator);
      const taskManager = new (_builderUtil().AsyncTaskManager)(packager.info.cancellationToken);
      const pluginArch = _this7.isUnicodeEnabled ? "x86-unicode" : "x86-ansi";
      taskManager.add((0, _bluebirdLst().coroutine)(function* () {
        scriptGenerator.addPluginDir(pluginArch, path.join((yield nsisResourcePathPromise.value), "plugins", pluginArch));
      }));
      taskManager.add((0, _bluebirdLst().coroutine)(function* () {
        const userPluginDir = path.join(packager.info.buildResourcesDir, pluginArch);
        const stat = yield (0, _fs().statOrNull)(userPluginDir);

        if (stat != null && stat.isDirectory()) {
          scriptGenerator.addPluginDir(pluginArch, userPluginDir);
        }
      }));
      taskManager.addTask((0, _nsisLang().addCustomMessageFileInclude)("messages.yml", packager, scriptGenerator, langConfigurator));

      if (!_this7.isPortable) {
        if (options.oneClick === false) {
          taskManager.addTask((0, _nsisLang().addCustomMessageFileInclude)("assistedMessages.yml", packager, scriptGenerator, langConfigurator));
        }

        taskManager.add((0, _bluebirdLst().coroutine)(function* () {
          const customInclude = yield packager.getResource(_this7.options.include, "installer.nsh");

          if (customInclude != null) {
            scriptGenerator.addIncludeDir(packager.info.buildResourcesDir);
            scriptGenerator.include(customInclude);
          }
        }));
      }

      yield taskManager.awaitTasks();
      return scriptGenerator.build();
    })();
  }

  computeFinalScript(originalScript, isInstaller) {
    var _this8 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const packager = _this8.packager;
      const options = _this8.options;
      const langConfigurator = new (_nsisLang().LangConfigurator)(options);
      const scriptGenerator = new (_nsisScriptGenerator().NsisScriptGenerator)();
      const taskManager = new (_builderUtil().AsyncTaskManager)(packager.info.cancellationToken);

      if (isInstaller) {
        // http://stackoverflow.com/questions/997456/nsis-license-file-based-on-language-selection
        taskManager.add(() => (0, _nsisLicense().computeLicensePage)(packager, options, scriptGenerator, langConfigurator.langs));
      }

      yield taskManager.awaitTasks();

      if (_this8.isPortable) {
        return scriptGenerator.build() + originalScript;
      }

      const preCompressedFileExtensions = _this8.getPreCompressedFileExtensions();

      if (preCompressedFileExtensions != null) {
        for (const [arch, dir] of _this8.archs.entries()) {
          const preCompressedAssets = yield (0, _fs().walk)(path.join(dir, "resources"), (file, stat) => stat.isDirectory() || preCompressedFileExtensions.some(it => file.endsWith(it)));

          if (preCompressedAssets.length !== 0) {
            const macro = new (_nsisScriptGenerator().NsisScriptGenerator)();

            for (const file of preCompressedAssets) {
              macro.file(`$INSTDIR\\${path.relative(dir, file).replace(/\//g, "\\")}`, file);
            }

            scriptGenerator.macro(`customFiles_${_builderUtil().Arch[arch]}`, macro);
          }
        }
      }

      const fileAssociations = packager.fileAssociations;

      if (fileAssociations.length !== 0) {
        scriptGenerator.include(path.join(path.join(_nsisUtil().nsisTemplatesDir, "include"), "FileAssociation.nsh"));

        if (isInstaller) {
          const registerFileAssociationsScript = new (_nsisScriptGenerator().NsisScriptGenerator)();

          for (const item of fileAssociations) {
            const extensions = (0, _builderUtil().asArray)(item.ext).map(_platformPackager().normalizeExt);

            for (const ext of extensions) {
              const customIcon = yield packager.getResource((0, _builderUtil().getPlatformIconFileName)(item.icon, false), `${extensions[0]}.ico`);
              let installedIconPath = "$appExe,0";

              if (customIcon != null) {
                installedIconPath = `$INSTDIR\\resources\\${path.basename(customIcon)}`;
                registerFileAssociationsScript.file(installedIconPath, customIcon);
              }

              const icon = `"${installedIconPath}"`;
              const commandText = `"Open with ${packager.appInfo.productName}"`;
              const command = '"$appExe $\\"%1$\\""';
              registerFileAssociationsScript.insertMacro("APP_ASSOCIATE", `"${ext}" "${item.name || ext}" "${item.description || ""}" ${icon} ${commandText} ${command}`);
            }
          }

          scriptGenerator.macro("registerFileAssociations", registerFileAssociationsScript);
        } else {
          const unregisterFileAssociationsScript = new (_nsisScriptGenerator().NsisScriptGenerator)();

          for (const item of fileAssociations) {
            for (const ext of (0, _builderUtil().asArray)(item.ext)) {
              unregisterFileAssociationsScript.insertMacro("APP_UNASSOCIATE", `"${(0, _platformPackager().normalizeExt)(ext)}" "${item.name || ext}"`);
            }
          }

          scriptGenerator.macro("unregisterFileAssociations", unregisterFileAssociationsScript);
        }
      }

      return scriptGenerator.build() + originalScript;
    })();
  }

}

exports.NsisTarget = NsisTarget;
//# sourceMappingURL=NsisTarget.js.map