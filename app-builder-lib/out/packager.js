"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Packager = void 0;

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

function _events() {
  const data = require("events");

  _events = function () {
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

function _lazyVal() {
  const data = require("lazy-val");

  _lazyVal = function () {
    return data;
  };

  return data;
}

var path = _interopRequireWildcard(require("path"));

function _appInfo() {
  const data = require("./appInfo");

  _appInfo = function () {
    return data;
  };

  return data;
}

function _asar() {
  const data = require("./asar/asar");

  _asar = function () {
    return data;
  };

  return data;
}

function _ElectronFramework() {
  const data = require("./electron/ElectronFramework");

  _ElectronFramework = function () {
    return data;
  };

  return data;
}

function _index() {
  const data = require("./index");

  _index = function () {
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

function _ProtonFramework() {
  const data = require("./ProtonFramework");

  _ProtonFramework = function () {
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

function _config() {
  const data = require("./util/config");

  _config = function () {
    return data;
  };

  return data;
}

function _macroExpander() {
  const data = require("./util/macroExpander");

  _macroExpander = function () {
    return data;
  };

  return data;
}

function _packageDependencies() {
  const data = require("./util/packageDependencies");

  _packageDependencies = function () {
    return data;
  };

  return data;
}

function _packageMetadata() {
  const data = require("./util/packageMetadata");

  _packageMetadata = function () {
    return data;
  };

  return data;
}

function _repositoryInfo() {
  const data = require("./util/repositoryInfo");

  _repositoryInfo = function () {
    return data;
  };

  return data;
}

function _yarn() {
  const data = require("./util/yarn");

  _yarn = function () {
    return data;
  };

  return data;
}

let createFrameworkInfo = (() => {
  var _ref = (0, _bluebirdLst().coroutine)(function* (configuration, packager) {
    if (configuration.protonNodeVersion != null) {
      // require("proton-builder/out/ProtonFramework")
      return (0, _ProtonFramework().createProtonFrameworkSupport)(configuration.protonNodeVersion, packager.appInfo);
    } else {
      return yield (0, _ElectronFramework().createElectronFrameworkSupport)(configuration, packager);
    }
  });

  return function createFrameworkInfo(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function addHandler(emitter, event, handler) {
  emitter.on(event, handler);
}

class Packager {
  //noinspection JSUnusedGlobalSymbols
  constructor(options, cancellationToken = new (_builderUtilRuntime().CancellationToken)()) {
    this.cancellationToken = cancellationToken;
    this._metadata = null;
    this._nodeModulesHandledExternally = false;
    this._isPrepackedAppAsar = false;
    this._devMetadata = null;
    this._configuration = null;
    this.isTwoPackageJsonProjectLayoutUsed = false;
    this.eventEmitter = new (_events().EventEmitter)();
    this._appInfo = null;
    this.tempDirManager = new (_builderUtil().TmpDir)("packager");
    this._repositoryInfo = new (_lazyVal().Lazy)(() => (0, _repositoryInfo().getRepositoryInfo)(this.projectDir, this.metadata, this.devMetadata));
    this.afterPackHandlers = [];
    this.debugLogger = new (_builderUtil().DebugLogger)(_builderUtil().log.isDebugEnabled);
    this._productionDeps = null;

    this.stageDirPathCustomizer = (target, packager, arch) => {
      return path.join(target.outDir, `__${target.name}-${_builderUtil().Arch[arch]}`);
    };

    this._buildResourcesDir = null;
    this._framework = null;

    if ("devMetadata" in options) {
      throw new (_builderUtil().InvalidConfigurationError)("devMetadata in the options is deprecated, please use config instead");
    }

    if ("extraMetadata" in options) {
      throw new (_builderUtil().InvalidConfigurationError)("extraMetadata in the options is deprecated, please use config.extraMetadata instead");
    }

    const targets = options.targets || new Map();

    if (options.targets == null) {
      options.targets = targets;
    }

    function processTargets(platform, types) {
      function commonArch(currentIfNotSpecified) {
        if (platform === _index().Platform.MAC) {
          return currentIfNotSpecified ? [_builderUtil().Arch.x64] : [];
        }

        const result = Array();
        return result.length === 0 && currentIfNotSpecified ? [(0, _builderUtil().archFromString)(process.arch)] : result;
      }

      let archToType = targets.get(platform);

      if (archToType == null) {
        archToType = new Map();
        targets.set(platform, archToType);
      }

      if (types.length === 0) {
        for (const arch of commonArch(false)) {
          archToType.set(arch, []);
        }

        return;
      }

      for (const type of types) {
        const suffixPos = type.lastIndexOf(":");

        if (suffixPos > 0) {
          (0, _builderUtil().addValue)(archToType, (0, _builderUtil().archFromString)(type.substring(suffixPos + 1)), type.substring(0, suffixPos));
        } else {
          for (const arch of commonArch(true)) {
            (0, _builderUtil().addValue)(archToType, arch, type);
          }
        }
      }
    }

    if (options.mac != null) {
      processTargets(_index().Platform.MAC, options.mac);
    }

    if (options.linux != null) {
      processTargets(_index().Platform.LINUX, options.linux);
    }

    if (options.win != null) {
      processTargets(_index().Platform.WINDOWS, options.win);
    }

    this.projectDir = options.projectDir == null ? process.cwd() : path.resolve(options.projectDir);
    this._appDir = this.projectDir;
    this.options = Object.assign({}, options, {
      prepackaged: options.prepackaged == null ? null : path.resolve(this.projectDir, options.prepackaged)
    });

    try {
      _builderUtil().log.info({
        version: "20.28.1"
      }, "electron-builder");
    } catch (e) {
      // error in dev mode without babel
      if (!(e instanceof ReferenceError)) {
        throw e;
      }
    }
  }

  get appDir() {
    return this._appDir;
  }

  get metadata() {
    return this._metadata;
  }

  get areNodeModulesHandledExternally() {
    return this._nodeModulesHandledExternally;
  }

  get isPrepackedAppAsar() {
    return this._isPrepackedAppAsar;
  }

  get devMetadata() {
    return this._devMetadata;
  }

  get config() {
    return this._configuration;
  }

  get appInfo() {
    return this._appInfo;
  }

  get repositoryInfo() {
    return this._repositoryInfo.value;
  }

  get productionDeps() {
    var _this = this;

    let result = this._productionDeps;

    if (result == null) {
      // https://github.com/electron-userland/electron-builder/issues/2551
      result = new (_lazyVal().Lazy)((0, _bluebirdLst().coroutine)(function* () {
        if (_this.config.beforeBuild == null || (yield (0, _fs().exists)(path.join(_this.appDir, "node_modules")))) {
          return yield (0, _packageDependencies().getProductionDependencies)(_this.appDir);
        } else {
          return [];
        }
      }));
      this._productionDeps = result;
    }

    return result;
  }

  get buildResourcesDir() {
    let result = this._buildResourcesDir;

    if (result == null) {
      result = path.resolve(this.projectDir, this.relativeBuildResourcesDirname);
      this._buildResourcesDir = result;
    }

    return result;
  }

  get relativeBuildResourcesDirname() {
    return this.config.directories.buildResources;
  }

  get framework() {
    return this._framework;
  }

  addAfterPackHandler(handler) {
    this.afterPackHandlers.push(handler);
  }

  artifactCreated(handler) {
    addHandler(this.eventEmitter, "artifactCreated", handler);
    return this;
  }

  dispatchArtifactCreated(event) {
    this.eventEmitter.emit("artifactCreated", event);
  }

  build() {
    var _this2 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      let configPath = null;
      let configFromOptions = _this2.options.config;

      if (typeof configFromOptions === "string") {
        // it is a path to config file
        configPath = configFromOptions;
        configFromOptions = null;
      } else if (configFromOptions != null && configFromOptions.extends != null && configFromOptions.extends.includes(".")) {
        configPath = configFromOptions.extends;
        delete configFromOptions.extends;
      }

      const projectDir = _this2.projectDir;
      const devPackageFile = path.join(projectDir, "package.json");
      _this2._devMetadata = yield (0, _promise().orNullIfFileNotExist)((0, _packageMetadata().readPackageJson)(devPackageFile));
      const devMetadata = _this2.devMetadata;
      const configuration = yield (0, _config().getConfig)(projectDir, configPath, configFromOptions, new (_lazyVal().Lazy)(() => Promise.resolve(devMetadata)));

      if (_builderUtil().log.isDebugEnabled) {
        _builderUtil().log.debug({
          config: getSafeEffectiveConfig(configuration)
        }, "effective config");
      }

      _this2._appDir = yield (0, _config().computeDefaultAppDirectory)(projectDir, configuration.directories.app);
      _this2.isTwoPackageJsonProjectLayoutUsed = _this2._appDir !== projectDir;
      const appPackageFile = _this2.isTwoPackageJsonProjectLayoutUsed ? path.join(_this2.appDir, "package.json") : devPackageFile; // tslint:disable:prefer-conditional-expression

      if (_this2.devMetadata != null && !_this2.isTwoPackageJsonProjectLayoutUsed) {
        _this2._metadata = _this2.devMetadata;
      } else {
        _this2._metadata = yield _this2.readProjectMetadataIfTwoPackageStructureOrPrepacked(appPackageFile);
      }

      (0, _builderUtil().deepAssign)(_this2.metadata, configuration.extraMetadata);

      if (_this2.isTwoPackageJsonProjectLayoutUsed) {
        _builderUtil().log.debug({
          devPackageFile,
          appPackageFile
        }, "two package.json structure is used");
      }

      (0, _packageMetadata().checkMetadata)(_this2.metadata, _this2.devMetadata, appPackageFile, devPackageFile);
      return yield _this2._build(configuration, _this2._metadata, _this2._devMetadata);
    })();
  } // external caller of this method always uses isTwoPackageJsonProjectLayoutUsed=false and appDir=projectDir, no way (and need) to use another values


  _build(configuration, metadata, devMetadata, repositoryInfo) {
    var _this3 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      yield (0, _config().validateConfig)(configuration, _this3.debugLogger);
      _this3._configuration = configuration;
      _this3._metadata = metadata;
      _this3._devMetadata = devMetadata;

      if (repositoryInfo != null) {
        _this3._repositoryInfo.value = Promise.resolve(repositoryInfo);
      }

      _this3._appInfo = new (_appInfo().AppInfo)(_this3, null);
      _this3._framework = yield createFrameworkInfo(_this3.config, _this3);
      const outDir = path.resolve(_this3.projectDir, (0, _macroExpander().expandMacro)(configuration.directories.output, null, _this3._appInfo));

      if (!_isCi().default && process.stdout.isTTY) {
        const effectiveConfigFile = path.join(outDir, "builder-effective-config.yaml");

        _builderUtil().log.info({
          file: _builderUtil().log.filePath(effectiveConfigFile)
        }, "writing effective config");

        yield (0, _fsExtraP().outputFile)(effectiveConfigFile, getSafeEffectiveConfig(configuration));
      } // because artifact event maybe dispatched several times for different publish providers


      const artifactPaths = new Set();

      _this3.artifactCreated(event => {
        if (event.file != null) {
          artifactPaths.add(event.file);
        }
      });

      const platformToTargets = yield (0, _promise().executeFinally)(_this3.doBuild(outDir), (0, _bluebirdLst().coroutine)(function* () {
        if (_this3.debugLogger.isEnabled) {
          yield _this3.debugLogger.save(path.join(outDir, "builder-debug.yml"));
        }

        yield _this3.tempDirManager.cleanup();
      }));
      return {
        outDir,
        artifactPaths: Array.from(artifactPaths),
        platformToTargets,
        configuration
      };
    })();
  }

  readProjectMetadataIfTwoPackageStructureOrPrepacked(appPackageFile) {
    var _this4 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      let data = yield (0, _promise().orNullIfFileNotExist)((0, _packageMetadata().readPackageJson)(appPackageFile));

      if (data != null) {
        return data;
      }

      data = yield (0, _promise().orNullIfFileNotExist)((0, _asar().readAsarJson)(path.join(_this4.projectDir, "app.asar"), "package.json"));

      if (data != null) {
        _this4._isPrepackedAppAsar = true;
        return data;
      }

      throw new Error(`Cannot find package.json in the ${path.dirname(appPackageFile)}`);
    })();
  }

  doBuild(outDir) {
    var _this5 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      const taskManager = new (_builderUtil().AsyncTaskManager)(_this5.cancellationToken);
      const platformToTarget = new Map();
      const createdOutDirs = new Set();

      for (const [platform, archToType] of _this5.options.targets) {
        if (_this5.cancellationToken.cancelled) {
          break;
        }

        if (platform === _index().Platform.MAC && process.platform === _index().Platform.WINDOWS.nodeName) {
          throw new (_builderUtil().InvalidConfigurationError)("Build for macOS is supported only on macOS, please see https://electron.build/multi-platform-build");
        }

        const packager = _this5.createHelper(platform);

        const nameToTarget = new Map();
        platformToTarget.set(platform, nameToTarget);

        for (const [arch, targetNames] of (0, _targetFactory().computeArchToTargetNamesMap)(archToType, packager.platformSpecificBuildOptions, platform)) {
          if (_this5.cancellationToken.cancelled) {
            break;
          }

          yield _this5.installAppDependencies(platform, arch);

          if (_this5.cancellationToken.cancelled) {
            break;
          }

          const targetList = (0, _targetFactory().createTargets)(nameToTarget, targetNames.length === 0 ? packager.defaultTarget : targetNames, outDir, packager);
          yield createOutDirIfNeed(targetList, createdOutDirs);
          yield packager.pack(outDir, arch, targetList, taskManager);
        }

        if (_this5.cancellationToken.cancelled) {
          break;
        }

        for (const target of nameToTarget.values()) {
          taskManager.addTask(target.finishBuild());
        }
      }

      yield taskManager.awaitTasks();
      return platformToTarget;
    })();
  }

  createHelper(platform) {
    if (this.options.platformPackagerFactory != null) {
      return this.options.platformPackagerFactory(this, platform);
    }

    switch (platform) {
      case _index().Platform.MAC:
        {
          const helperClass = require("./macPackager").default;

          return new helperClass(this);
        }

      case _index().Platform.WINDOWS:
        {
          const helperClass = require("./winPackager").WinPackager;

          return new helperClass(this);
        }

      case _index().Platform.LINUX:
        return new (require("./linuxPackager").LinuxPackager)(this);

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  installAppDependencies(platform, arch) {
    var _this6 = this;

    return (0, _bluebirdLst().coroutine)(function* () {
      if (_this6.options.prepackaged != null || _this6.framework.isNpmRebuildRequired !== true) {
        return;
      }

      const frameworkInfo = {
        version: _this6.framework.version,
        useCustomDist: _this6.config.muonVersion == null
      };
      const config = _this6.config;

      if (config.nodeGypRebuild === true) {
        _builderUtil().log.info({
          arch: _builderUtil().Arch[arch]
        }, "executing node-gyp rebuild");

        yield (0, _builderUtil().exec)(process.platform === "win32" ? "node-gyp.cmd" : "node-gyp", ["rebuild"], {
          env: (0, _yarn().getGypEnv)(frameworkInfo, platform.nodeName, _builderUtil().Arch[arch], true)
        });
      }

      if (config.npmRebuild === false) {
        _builderUtil().log.info({
          reason: "npmRebuild is set to false"
        }, "skipped app dependencies rebuild");

        return;
      }

      const beforeBuild = (0, _platformPackager().resolveFunction)(config.beforeBuild, "beforeBuild");

      if (beforeBuild != null) {
        const performDependenciesInstallOrRebuild = yield beforeBuild({
          appDir: _this6.appDir,
          electronVersion: _this6.config.electronVersion,
          platform,
          arch: _builderUtil().Arch[arch]
        }); // If beforeBuild resolves to false, it means that handling node_modules is done outside of electron-builder.

        _this6._nodeModulesHandledExternally = !performDependenciesInstallOrRebuild;

        if (!performDependenciesInstallOrRebuild) {
          return;
        }
      }

      if (config.buildDependenciesFromSource === true && platform.nodeName !== process.platform) {
        _builderUtil().log.info({
          reason: "platform is different and buildDependenciesFromSource is set to true"
        }, "skipped app dependencies rebuild");
      } else {
        yield (0, _yarn().installOrRebuild)(config, _this6.appDir, {
          frameworkInfo,
          platform: platform.nodeName,
          arch: _builderUtil().Arch[arch],
          productionDeps: _this6.productionDeps
        });
      }
    })();
  }

  afterPack(context) {
    const afterPack = (0, _platformPackager().resolveFunction)(this.config.afterPack, "afterPack");
    const handlers = this.afterPackHandlers.slice();

    if (afterPack != null) {
      // user handler should be last
      handlers.push(afterPack);
    }

    return _bluebirdLst().default.each(handlers, it => it(context));
  }

}

exports.Packager = Packager;

function createOutDirIfNeed(targetList, createdOutDirs) {
  const ourDirs = new Set();

  for (const target of targetList) {
    // noinspection SuspiciousInstanceOfGuard
    if (target instanceof _targetFactory().NoOpTarget) {
      continue;
    }

    const outDir = target.outDir;

    if (!createdOutDirs.has(outDir)) {
      ourDirs.add(outDir);
    }
  }

  if (ourDirs.size > 0) {
    return _bluebirdLst().default.map(Array.from(ourDirs).sort(), it => {
      createdOutDirs.add(it);
      return (0, _fsExtraP().ensureDir)(it);
    });
  }

  return Promise.resolve();
}

function getSafeEffectiveConfig(configuration) {
  const o = JSON.parse((0, _builderUtil().safeStringifyJson)(configuration));

  if (o.cscLink != null) {
    o.cscLink = "<hidden by builder>";
  }

  return (0, _builderUtil().serializeToYaml)(o, true);
} 
//# sourceMappingURL=packager.js.map