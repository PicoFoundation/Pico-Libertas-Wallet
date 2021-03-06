"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSignVendorPath = getSignVendorPath;
exports.isOldWin6 = isOldWin6;
exports.getCertificateFromStoreInfo = exports.sign = void 0;

function _bluebirdLst() {
  const data = require("bluebird-lst");

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

function _binDownload() {
  const data = require("./binDownload");

  _binDownload = function () {
    return data;
  };

  return data;
}

function _bundledTool() {
  const data = require("builder-util/out/bundledTool");

  _bundledTool = function () {
    return data;
  };

  return data;
}

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

function os() {
  const data = _interopRequireWildcard(require("os"));

  os = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _platformPackager() {
  const data = require("./platformPackager");

  _platformPackager = function () {
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

function _vm() {
  const data = require("./vm/vm");

  _vm = function () {
    return data;
  };

  return data;
}

let doSign = (() => {
  var _ref3 = (0, _bluebirdLst().coroutine)(function* (configuration, packager) {
    // https://github.com/electron-userland/electron-builder/pull/1944
    const timeout = parseInt(process.env.SIGNTOOL_TIMEOUT, 10) || 10 * 60 * 1000;
    let tool;
    let args;
    let env = process.env;
    let vm;

    if (configuration.path.endsWith(".appx") || !("file" in configuration.cscInfo)
    /* certificateSubjectName and other such options */
    ) {
        vm = yield packager.vm.value;
        tool = getWinSignTool((yield getSignVendorPath()));
        args = computeSignToolArgs(configuration, true, vm);
      } else {
      vm = new (_vm().VmManager)();
      const toolInfo = yield getToolPath();
      tool = toolInfo.path;
      args = configuration.computeSignToolArgs(process.platform === "win32");

      if (toolInfo.env != null) {
        env = toolInfo.env;
      }
    }

    try {
      yield vm.exec(tool, args, {
        timeout,
        env
      });
    } catch (e) {
      if (e.message.includes("The file is being used by another process")) {
        yield new Promise((resolve, reject) => {
          setTimeout(() => {
            vm.exec(tool, args, {
              timeout,
              env
            }).then(resolve).catch(reject);
          }, 2000);
        });
      }

      throw e;
    }
  });

  return function doSign(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})(); // on windows be aware of http://stackoverflow.com/a/32640183/1910191


let getToolPath = (() => {
  var _ref4 = (0, _bluebirdLst().coroutine)(function* () {
    if ((0, _flags().isUseSystemSigncode)()) {
      return {
        path: "osslsigncode"
      };
    }

    const result = process.env.SIGNTOOL_PATH;

    if (result) {
      return {
        path: result
      };
    }

    const vendorPath = yield getSignVendorPath();

    if (process.platform === "win32") {
      // use modern signtool on Windows Server 2012 R2 to be able to sign AppX
      return {
        path: getWinSignTool(vendorPath)
      };
    } else if (process.platform === "darwin") {
      let suffix = null;

      try {
        if (yield (0, _builderUtil().isMacOsSierra)()) {
          const toolDirPath = path.join(vendorPath, process.platform, "10.12");
          return {
            path: path.join(toolDirPath, "osslsigncode"),
            env: (0, _bundledTool().computeToolEnv)([path.join(toolDirPath, "lib")])
          };
        } else if (_isCi().default) {
          // not clear for what we do this instead of using version detection
          suffix = "ci";
        }
      } catch (e) {
        _builderUtil().log.warn(`${e.stack || e}`);
      }

      return {
        path: path.join(vendorPath, process.platform, `${suffix == null ? "" : `${suffix}/`}osslsigncode`)
      };
    } else {
      return {
        path: path.join(vendorPath, process.platform, "osslsigncode")
      };
    }
  });

  return function getToolPath() {
    return _ref4.apply(this, arguments);
  };
})(); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSignVendorPath() {
  //noinspection SpellCheckingInspection
  return (0, _binDownload().getBinFromGithub)("winCodeSign", "2.3.1", "J64zdgTQNW9D7gMLXHFiOB7haTmJNKqMj9+rR9wSRo83wKrOypO49dRpmjENp7sm7uo6Cdx7FK3lhVod0gfvJw==");
}

let sign = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (options, packager) {
    let hashes = options.options.signingHashAlgorithms; // msi does not support dual-signing

    if (options.path.endsWith(".msi")) {
      hashes = [hashes != null && !hashes.includes("sha1") ? "sha256" : "sha1"];
    } else if (options.path.endsWith(".appx")) {
      hashes = ["sha256"];
    } else if (hashes == null) {
      hashes = ["sha1", "sha256"];
    } else {
      hashes = Array.isArray(hashes) ? hashes : [hashes];
    }

    function defaultExecutor(configuration) {
      return doSign(configuration, packager);
    }

    const executor = (0, _platformPackager().resolveFunction)(options.options.sign, "sign") || defaultExecutor;
    let isNest = false;

    for (const hash of hashes) {
      const taskConfiguration = Object.assign({}, options, {
        hash,
        isNest
      });
      yield executor(Object.assign({}, taskConfiguration, {
        computeSignToolArgs: isWin => computeSignToolArgs(taskConfiguration, isWin)
      }));
      isNest = true;

      if (taskConfiguration.resultOutputPath != null) {
        yield (0, _fsExtraP().rename)(taskConfiguration.resultOutputPath, options.path);
      }
    }
  });

  return function sign(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.sign = sign;

let getCertificateFromStoreInfo = (() => {
  var _ref2 = (0, _bluebirdLst().coroutine)(function* (options, vm) {
    const certificateSubjectName = options.certificateSubjectName;
    const certificateSha1 = options.certificateSha1; // ExcludeProperty doesn't work, so, we cannot exclude RawData, it is ok
    // powershell can return object if the only item

    const rawResult = yield vm.exec("powershell.exe", ["Get-ChildItem -Recurse Cert: -CodeSigningCert | Select-Object -Property Subject,PSParentPath,Thumbprint | ConvertTo-Json -Compress"]);
    const certList = rawResult.length === 0 ? [] : (0, _builderUtil().asArray)(JSON.parse(rawResult));

    for (const certInfo of certList) {
      if (certificateSubjectName != null) {
        if (!certInfo.Subject.includes(certificateSubjectName)) {
          continue;
        }
      } else if (certInfo.Thumbprint !== certificateSha1) {
        continue;
      }

      const parentPath = certInfo.PSParentPath;
      const store = parentPath.substring(parentPath.lastIndexOf("\\") + 1);

      _builderUtil().log.debug({
        store,
        PSParentPath: parentPath
      }, "auto-detect certificate store"); // https://github.com/electron-userland/electron-builder/issues/1717


      const isLocalMachineStore = parentPath.includes("Certificate::LocalMachine");

      _builderUtil().log.debug(null, "auto-detect using of LocalMachine store");

      return {
        thumbprint: certInfo.Thumbprint,
        subject: certInfo.Subject,
        store,
        isLocalMachineStore
      };
    }

    throw new Error(`Cannot find certificate ${certificateSubjectName || certificateSha1}, all certs: ${rawResult}`);
  });

  return function getCertificateFromStoreInfo(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.getCertificateFromStoreInfo = getCertificateFromStoreInfo;

function computeSignToolArgs(options, isWin, vm = new (_vm().VmManager)()) {
  const inputFile = vm.toVmFile(options.path);
  const outputPath = isWin ? inputFile : getOutputPath(inputFile, options.hash);

  if (!isWin) {
    options.resultOutputPath = outputPath;
  }

  const args = isWin ? ["sign"] : ["-in", inputFile, "-out", outputPath];

  if (process.env.ELECTRON_BUILDER_OFFLINE !== "true") {
    const timestampingServiceUrl = options.options.timeStampServer || "http://timestamp.verisign.com/scripts/timstamp.dll";

    if (isWin) {
      args.push(options.isNest || options.hash === "sha256" ? "/tr" : "/t", options.isNest || options.hash === "sha256" ? options.options.rfc3161TimeStampServer || "http://timestamp.comodoca.com/rfc3161" : timestampingServiceUrl);
    } else {
      args.push("-t", timestampingServiceUrl);
    }
  }

  const certificateFile = options.cscInfo.file;

  if (certificateFile == null) {
    const cscInfo = options.cscInfo;
    const subjectName = cscInfo.thumbprint;

    if (!isWin) {
      throw new Error(`${subjectName == null ? "certificateSha1" : "certificateSubjectName"} supported only on Windows`);
    }

    args.push("/sha1", cscInfo.thumbprint);
    args.push("/s", cscInfo.store);

    if (cscInfo.isLocalMachineStore) {
      args.push("/sm");
    }
  } else {
    const certExtension = path.extname(certificateFile);

    if (certExtension === ".p12" || certExtension === ".pfx") {
      args.push(isWin ? "/f" : "-pkcs12", vm.toVmFile(certificateFile));
    } else {
      throw new Error(`Please specify pkcs12 (.p12/.pfx) file, ${certificateFile} is not correct`);
    }
  }

  if (!isWin || options.hash !== "sha1") {
    args.push(isWin ? "/fd" : "-h", options.hash);

    if (isWin && process.env.ELECTRON_BUILDER_OFFLINE !== "true") {
      args.push("/td", "sha256");
    }
  }

  if (options.name) {
    args.push(isWin ? "/d" : "-n", options.name);
  }

  if (options.site) {
    args.push(isWin ? "/du" : "-i", options.site);
  } // msi does not support dual-signing


  if (options.isNest) {
    args.push(isWin ? "/as" : "-nest");
  }

  const password = options.cscInfo == null ? null : options.cscInfo.password;

  if (password) {
    args.push(isWin ? "/p" : "-pass", password);
  }

  if (options.options.additionalCertificateFile) {
    args.push(isWin ? "/ac" : "-ac", vm.toVmFile(options.options.additionalCertificateFile));
  }

  const httpsProxyFromEnv = process.env.HTTPS_PROXY;

  if (!isWin && httpsProxyFromEnv != null && httpsProxyFromEnv.length) {
    args.push("-p", httpsProxyFromEnv);
  }

  if (isWin) {
    // https://github.com/electron-userland/electron-builder/issues/2875#issuecomment-387233610
    args.push("/debug"); // must be last argument

    args.push(inputFile);
  }

  return args;
}

function getOutputPath(inputPath, hash) {
  const extension = path.extname(inputPath);
  return path.join(path.dirname(inputPath), `${path.basename(inputPath, extension)}-signed-${hash}${extension}`);
}
/** @internal */


function isOldWin6() {
  const winVersion = os().release();
  return winVersion.startsWith("6.") && !winVersion.startsWith("6.3");
}

function getWinSignTool(vendorPath) {
  // use modern signtool on Windows Server 2012 R2 to be able to sign AppX
  if (isOldWin6()) {
    return path.join(vendorPath, "windows-6", "signtool.exe");
  } else {
    return path.join(vendorPath, "windows-10", process.arch, "signtool.exe");
  }
}
//# sourceMappingURL=windowsCodeSign.js.map