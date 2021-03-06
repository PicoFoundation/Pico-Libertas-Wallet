"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WinPackager = void 0;

function _bluebirdLst() {
  const data = _interopRequireWildcard(require("bluebird-lst"));

  _bluebirdLst = function () {
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

function _crypto() {
  const data = require("crypto");

  _crypto = function () {
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

function _isCi() {
  const data = _interopRequireDefault(require("is-ci"));

  _isCi = function () {
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

function _fs() {
  const data = require("builder-util/out/fs");

  _fs = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("builder-util/out/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _codeSign() {
  const data = require("./codeSign");

  _codeSign = function () {
    return data;
  };

  return data;
}

function _core() {
  const data = require("./core");

  _core = function () {
    return data;
  };

  return data;
}

function _platformPackager() {
  const data = require("./platformPackager");

  _platformPackager = function () {
    return data;
  };

  return data;
}

function _NsisTarget() {
  const data = require("./targets/nsis/NsisTarget");

  _NsisTarget = function () {
    return data;
  };

  return data;
}

function _nsisUtil() {
  const data = require("./targets/nsis/nsisUtil");

  _nsisUtil = function () {
    return data;
  };

  return data;
}

function _WebInstallerTarget() {
  const data = require("./targets/nsis/WebInstallerTarget");

  _WebInstallerTarget = function () {
    return data;
  };

  return data;
}

function _targetFactory() {
  const data = require("./targets/targetFactory");

  _targetFactory = function () {
    return data;
  };

  return data;
}

function _cacheManager() {
  const data = require("./util/cacheManager");

  _cacheManager = function () {
    return data;
  };

  return data;
}

function _flags() {
  const data = require("./util/flags");

  _flags = function () {
    return data;
  };

  return data;
}

function _timer() {
  const data = require("./util/timer");

  _timer = function () {
    return data;
  };

  return data;
}

function _vm() {
  const data = require("./vm/vm");

  _vm = function () {
    return data;
  };

  return data;
}

function _windowsCodeSign() {
  const data = require("./windowsCodeSign");

  _windowsCodeSign = function () {
    return data;
  };

  return data;
}

function _wine() {
  const data = require("./wine");

  _wine = function () {
    return data;
  };

  return data;
}

let extractCommonNameUsingOpenssl = (() => {
  var _ref3 = (0, _bluebirdLst().coroutine)(function* (password, certPath) {
    const result = yield (0, _builderUtil().exec)("openssl", ["pkcs12", "-nokeys", "-nodes", "-passin", `pass:${password}`, "-nomacver", "-clcerts", "-in", certPath], {
      timeout: 30 * 1000
    }, debugOpenssl.enabled);
    const match = result.match(/^subject.*\/CN=([^\/\n]+)/m);

    if (match == null || match[1] == null) {
      throw new Error(`Cannot extract common name from p12: ${result}`);
    } else {
      return match[1];
    }
  });

  return function extractCommonNameUsingOpenssl(_x, _x2) {
    return _ref3.apply(this, arguments);
  };
})(); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

class WinPackager extends _platformPackager().PlatformPackager {
  constructor(info) {
    var _this;

    _this = super(info, _core().Platform.WINDOWS);
    this.cscInfo = new (_lazyVal().Lazy)(() => {
      const platformSpecificBuildOptions = this.platformSpecificBuildOptions;

      if (platformSpecificBuildOptions.certificateSubjectName != null || platformSpecificBuildOptions.certificateSha1 != null) {
        return this.vm.value.then(vm => (0, _windowsCodeSign().getCertificateFromStoreInfo)(platformSpecificBuildOptions, vm)).catch(e => {
          // https://github.com/electron-userland/electron-builder/pull/2397
          if (platformSpecificBuildOptions.sign == null) {
            throw e;
          } else {
            _builderUtil().log.debug({
              error: e
            }, "getCertificateFromStoreInfo error");

            return null;
          }
        });
      }

      const certificateFile = platformSpecificBuildOptions.certificateFile;

      if (certificateFile != null) {
        const certificatePassword = this.getCscPassword();
        return Promise.resolve({
          file: certificateFile,
          password: certificatePassword == null ? null : certificatePassword.trim()
        });
      }

      const cscLink = this.getCscLink("WIN_CSC_LINK");

      if (cscLink == null) {
        return Promise.resolve(null);
      }

      return (0, _codeSign().downloadCertificate)(cscLink, this.info.tempDirManager, this.projectDir).then(path => {
        return {
          file: path,
          password: this.getCscPassword()
        };
      });
    });
    this._iconPath = new (_lazyVal().Lazy)(() => this.getOrConvertIcon("ico"));
    this.vm = new (_lazyVal().Lazy)(() => process.platform === "win32" ? Promise.resolve(new (_vm().VmManager)()) : (0, _vm().getWindowsVm)(this.debugLogger));
    this.computedPublisherSubjectOnWindowsOnly = new (_lazyVal().Lazy)((0, _bluebirdLst().coroutine)(function* () {
      const cscInfo = yield _this.cscInfo.value;

      if (cscInfo == null) {
        return null;
      }

      if ("subject" in cscInfo) {
        return cscInfo.subject;
      }

      const vm = yield _this.vm.value;
      const info = cscInfo;
      const certFile = vm.toVmFile(info.file); // https://github.com/electron-userland/electron-builder/issues/1735

      const args = info.password ? [`(Get-PfxData "${certFile}" -Password (ConvertTo-SecureString -String "${info.password}" -Force -AsPlainText)).EndEntityCertificates.Subject`] : [`(Get-PfxCertificate "${certFile}").Subject`];
      return yield vm.exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command"].concat(args), {
        timeout: 30 * 1000
      }).then(it => it.trim());
    }));
    this.computedPublisherName = new (_lazyVal().Lazy)((0, _bluebirdLst().coroutine)(function* () {
      let publisherName = _this.platformSpecificBuildOptions.publisherName;

      if (publisherName === null) {
        return null;
      }

      const cscInfo = yield _this.cscInfo.value;

      if (cscInfo == null) {
        return null;
      }

      if ("subject" in cscInfo) {
        return (0, _builderUtil().asArray)((0, _builderUtilRuntime().parseDn)(cscInfo.subject).get("CN"));
      }

      const cscFile = cscInfo.file;

      if (publisherName == null && cscFile != null) {
        try {
          if (process.platform === "win32") {
            const subject = yield _this.computedPublisherSubjectOnWindowsOnly.value;
            const commonName = subject == null ? null : (0, _builderUtilRuntime().parseDn)(subject).get("CN");

            if (commonName) {
              return (0, _builderUtil().asArray)(commonName);
            }
          } else {
            publisherName = yield extractCommonNameUsingOpenssl(cscInfo.password || "", cscFile);
          }
        } catch (e) {
          throw new Error(`Cannot extract publisher name from code signing certificate, please file issue. As workaround, set win.publisherName: ${e.stack || e}`);
        }
      }

      return publisherName == null ? null : (0, _builderUtil().asArray)(publisherName);
    }));
  }

  get isForceCodeSigningVerification() {
    return this.platformSpecificBuildOptions.verifyUpdateCodeSignature !== false;
  }

  get defaultTarget() {
    return ["nsis"];
  }

  doGetCscPassword() {
    return (0, _platformPackager().chooseNotNull)((0, _platformPackager().chooseNotNull)(this.platformSpecificBuildOptions.certificatePassword, process.env.WIN_CSC_KEY_PASSWORD), super.doGetCscPassword());
  }

  createTargets(targets, mapper) {
    let copyElevateHelper;

    const getCopyElevateHelper = () => {
      if (copyElevateHelper == null) {
        copyElevateHelper = new (_nsisUtil().CopyElevateHelper)();
      }

      return copyElevateHelper;
    };

    let helper;

    const getHelper = () => {
      if (helper == null) {
        helper = new (_nsisUtil().AppPackageHelper)(getCopyElevateHelper());
      }

      return helper;
    };

    for (const name of targets) {
      if (name === _core().DIR_TARGET) {
        continue;
      }

      if (name === "nsis" || name === "portable") {
        mapper(name, outDir => new (_NsisTarget().NsisTarget)(this, outDir, name, getHelper()));
      } else if (name === "nsis-web") {
        // package file format differs from nsis target
        mapper(name, outDir => new (_WebInstallerTarget().WebInstallerTarget)(this, path.join(outDir, name), name, new (_nsisUtil().AppPackageHelper)(getCopyElevateHelper())));
      } else {
        const targetClass = (() => {
          switch (name) {
            case "squirrel":
              try {
                return require("electron-builder-squirrel-windows").default;
              } catch (e) {
                throw new (_builderUtil().InvalidConfigurationError)(`Module electron-builder-squirrel-windows must be installed in addition to build Squirrel.Windows: ${e.stack || e}`);
              }

            case "appx":
              return require("./targets/AppxTarget").default;

            case "msi":
              return require("./targets/MsiTarget").default;

            default:
              return null;
          }
        })();

        mapper(name, outDir => targetClass === null ? (0, _targetFactory().createCommonTarget)(name, outDir, this) : new targetClass(this, outDir, name));
      }
    }
  }

  getIconPath() {
    return this._iconPath.value;
  }

  sign(file, logMessagePrefix) {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const signOptions = {
        path: file,
        name: _this2.appInfo.productName,
        site: yield _this2.appInfo.computePackageUrl(),
        options: _this2.platformSpecificBuildOptions
      };
      const cscInfo = yield _this2.cscInfo.value;

      if (cscInfo == null) {
        if (_this2.platformSpecificBuildOptions.sign != null) {
          yield (0, _windowsCodeSign().sign)(signOptions, _this2);
        } else if (_this2.forceCodeSigning) {
          throw new (_builderUtil().InvalidConfigurationError)(`App is not signed and "forceCodeSigning" is set to true, please ensure that code signing configuration is correct, please see https://electron.build/code-signing`);
        }

        return;
      }

      if (logMessagePrefix == null) {
        logMessagePrefix = "signing";
      }

      if ("file" in cscInfo) {
        _builderUtil().log.info({
          file: _builderUtil().log.filePath(file),
          certificateFile: cscInfo.file
        }, logMessagePrefix);
      } else {
        const info = cscInfo;

        _builderUtil().log.info({
          file: _builderUtil().log.filePath(file),
          subject: info.subject,
          thumbprint: info.thumbprint,
          store: info.store,
          user: info.isLocalMachineStore ? "local machine" : "current user"
        }, logMessagePrefix);
      }

      yield _this2.doSign(Object.assign({}, signOptions, {
        cscInfo,
        options: Object.assign({}, _this2.platformSpecificBuildOptions)
      }));
    })();
  }

  doSign(options) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      for (let i = 0; i < 3; i++) {
        try {
          yield (0, _windowsCodeSign().sign)(options, _this3);
          break;
        } catch (e) {
          // https://github.com/electron-userland/electron-builder/issues/1414
          const message = e.message;

          if (message != null && message.includes("Couldn't resolve host name")) {
            _builderUtil().log.warn({
              error: message,
              attempt: i + 1
            }, `cannot sign`);

            continue;
          }

          throw e;
        }
      }
    })();
  }

  signAndEditResources(file, arch, outDir, internalName, requestedExecutionLevel) {
    var _this4 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const appInfo = _this4.appInfo;
      const files = [];
      const args = [file, "--set-version-string", "FileDescription", appInfo.productName, "--set-version-string", "ProductName", appInfo.productName, "--set-version-string", "LegalCopyright", appInfo.copyright, "--set-file-version", appInfo.buildVersion, "--set-product-version", appInfo.getVersionInWeirdWindowsForm()];

      if (internalName != null) {
        args.push("--set-version-string", "InternalName", internalName, "--set-version-string", "OriginalFilename", "");
      }

      if (requestedExecutionLevel != null && requestedExecutionLevel !== "asInvoker") {
        args.push("--set-requested-execution-level", requestedExecutionLevel);
      }

      (0, _builderUtil().use)(appInfo.companyName, it => args.push("--set-version-string", "CompanyName", it));
      (0, _builderUtil().use)(_this4.platformSpecificBuildOptions.legalTrademarks, it => args.push("--set-version-string", "LegalTrademarks", it));
      const iconPath = yield _this4.getIconPath();
      (0, _builderUtil().use)(iconPath, it => {
        files.push(it);
        args.push("--set-icon", it);
      });
      const config = _this4.config;
      const cscInfoForCacheDigest = !(0, _flags().isBuildCacheEnabled)() || _isCi().default || config.electronDist != null ? null : yield _this4.cscInfo.value;
      let buildCacheManager = null; // resources editing doesn't change executable for the same input and executed quickly - no need to complicate

      if (cscInfoForCacheDigest != null) {
        const cscFile = cscInfoForCacheDigest.file;

        if (cscFile != null) {
          files.push(cscFile);
        }

        const timer = (0, _timer().time)("executable cache");
        const hash = (0, _crypto().createHash)("sha512");
        hash.update(config.electronVersion || "no electronVersion");
        hash.update(config.muonVersion || "no muonVersion");
        hash.update(JSON.stringify(_this4.platformSpecificBuildOptions));
        hash.update(JSON.stringify(args));
        hash.update(_this4.platformSpecificBuildOptions.certificateSha1 || "no certificateSha1");
        hash.update(_this4.platformSpecificBuildOptions.certificateSubjectName || "no subjectName");
        buildCacheManager = new (_cacheManager().BuildCacheManager)(outDir, file, arch);

        if (yield buildCacheManager.copyIfValid((yield (0, _cacheManager().digest)(hash, files)))) {
          timer.end();
          return;
        }

        timer.end();
      }

      const timer = (0, _timer().time)("wine&sign"); // wine supports only ia32

      yield (0, _wine().execWine)(path.join((yield (0, _windowsCodeSign().getSignVendorPath)()), `rcedit-${process.platform === "win32" ? process.arch : "ia32"}.exe`), args);
      yield _this4.sign(file);
      timer.end();

      if (buildCacheManager != null) {
        yield buildCacheManager.save();
      }
    })();
  }

  isSignDlls() {
    return this.platformSpecificBuildOptions.signDlls === true;
  }

  createTransformerForExtraFiles(packContext) {
    if (this.platformSpecificBuildOptions.signAndEditExecutable === false) {
      return null;
    }

    return file => {
      if (file.endsWith(".exe") || this.isSignDlls() && file.endsWith(".dll")) {
        const parentDir = path.dirname(file);

        if (parentDir !== packContext.appOutDir) {
          return new (_fs().CopyFileTransformer)(file => this.sign(file));
        }
      }

      return null;
    };
  }

  signApp(packContext, isAsar) {
    var _this5 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const exeFileName = `${_this5.appInfo.productFilename}.exe`;

      if (_this5.platformSpecificBuildOptions.signAndEditExecutable === false) {
        return;
      }

      yield _bluebirdLst().default.map((0, _fsExtraP().readdir)(packContext.appOutDir), file => {
        if (file === exeFileName) {
          return _this5.signAndEditResources(path.join(packContext.appOutDir, exeFileName), packContext.arch, packContext.outDir, path.basename(exeFileName, ".exe"), _this5.platformSpecificBuildOptions.requestedExecutionLevel);
        } else if (file.endsWith(".exe") || _this5.isSignDlls() && file.endsWith(".dll")) {
          return _this5.sign(path.join(packContext.appOutDir, file));
        }

        return null;
      });

      if (!isAsar) {
        return;
      }

      const outResourcesDir = path.join(packContext.appOutDir, "resources", "app.asar.unpacked");
      yield _bluebirdLst().default.map((0, _promise().orIfFileNotExist)((0, _fsExtraP().readdir)(outResourcesDir), []), file => {
        if (file.endsWith(".exe") || file.endsWith(".dll")) {
          return _this5.sign(path.join(outResourcesDir, file));
        } else {
          return null;
        }
      });
    })();
  }

}

exports.WinPackager = WinPackager;
const debugOpenssl = (0, _debug2.default)("electron-builder:openssl");
//# sourceMappingURL=winPackager.js.map