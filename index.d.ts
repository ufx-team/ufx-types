import minimist from 'minimist';
import { Inquirer } from "inquirer";
import { Chalk } from 'chalk';
import debug from 'debug'
import * as fs from "./fs";

export = ufx;
export as namespace ufx;

declare namespace ufx {

  type debugOpts = {
    namespace: string,
    enabled: boolean,
    useColors: boolean,
    color: number,
    destroy: Function
    extend: Function
    inspectOpts: {}
  };


  export type ufxObj<T> = {
    [name: string]: T;
  }

  export type logFn = (moduleName?: string) => Log;

  export interface Log {
    info(...content: any[]): void;
    success(...content: any[]): void;
    warn(...content: any[]): void;
    error(...content: any[]): void;
    debug: debugOpts & any;
  }

  export type parsedArgs = minimist.ParsedArgs;

  export interface RuntimeEnv {
    isIntranet(): boolean;
    npmRegistry: string;
    isAlibabanet?: boolean;
    scope?: string;
  }

  export interface BaseContext {
    nameSpace: string;
    cliInfo?: any;
    baseInfo?: any;
    args?: parsedArgs;
    env?: RuntimeEnv;
    npmTagName?:string;
  }

  export type checkResult = {
    status: boolean;
    type?: string | null;
    pkgInfo?: any;
    oldPkgInfo?: any;
  }

  export interface CoreContext extends BaseContext {
    cli?: {
      argv?: parsedArgs // 兼容老版本core context，迭代一定周期后可以清理掉这个兼容
    };
    getBaseModule: base.Modules;
  }

  export interface Ufx extends BaseContext {
    modules: ufxObj<any>;
    commands: ufxObj<any>;
    log: Log;
    currCommand: string;
    run(cmd?: string | null): void;
    setContext(type: 'modules' | 'commands'): void;
    setCurrCommand(cmd?: string): void;
  }

  export namespace base {
    type commondFactory = (this: Base) => Promise<void> | void;

    type Modules = {
      (this: Base, name: 'cache'): Cache;
      (this: Base, name: 'env'): Env;
      (this: Base, name: 'home'): Home;
      (this: Base, name: 'npm'): Npm;
      (this: Base, name: 'check'): Check;
      (this: Base, name: 'setting'): Setting;
      (name: 'utils'): Utils;
      (name: 'log'): logFn;
      (name: string): any;
    };

    type Commands = {
      (name: string): (this: Base) => Promise<void> | void;
    }

    // CLI构造函数接口
    export interface Base extends Ufx {
      getBaseModule: Modules;
      getBaseCommand: Commands;
      baseInfo: any;
      initCore(): void;
    }

    export interface Cache {
      get(key: string): any;
      set(key: string, value: any, opts?: object): boolean;
      remove(key: string): boolean;
    }

    export interface Env {
      isAlibabanet(host?: string): Promise<boolean>;
      isIntranet(): Promise<boolean>;
      getRegistry(): Promise<string>;
      setEnv(env: EnvType): void;
      resetEnv(): void;
    }

    export interface Home {
      init(): void;
      initHome(): void;
      initHomePkg(): void;
      initCore(): void;
      cleanCoreDir(): void;
      cleanCacheFile(): void;
      getHomePath(): string;
      getCorePath(): string;
      getCoreModulePath(): string;
      getCacheFilePath(): string;
    }

    export type npmCommond = 'install' | 'uninstall' | 'update' | 'link';

    export interface Npm {
      run(installer: string, paths: string | any[], options: object): Promise<any>;
      get(name?: npmCommond): string;
      install(pkg: string | any[], options?: object): Promise<any>;
      getNpmInfo(name: string, options?: object): Promise<any>;
    }

    

    export interface Check {
      getCoreInfo(): any;
      installCore(coreName: string, opts?: object): Promise<void>;
      core(forceUpdae?: boolean): Promise<checkResult>;
      base(): Promise<checkResult>;
      cli(): Promise<checkResult>;
      getUpdateStatus(type: 'base'|'cli'): Promise<checkResult>;
      printCliUpdateTips(opts: checkResult): void;
      printCoreUpdateTips(opts: checkResult): void;
    }

    export type Setting = {
      'DEFAULT_CHERCK_EXPRIES': number;
      'NET_CHERCK_EXPRIES': number;
      'USER_HOME_DIR': string;
      'CACHE_DIR_NAME': string;
      'CACHE_FILE_NAME': string;
      'CLI_MODULE_NAME': string;
      'BASE_MODULE_NAME': string;
      'CORE_CACHE_DIR_NAME': string;
      'CORE_MODULE_NAME': string;
      'CORE_CACHE_KEY': string;
      'CLI_CACHE_KEY': string;
      'BASE_CACHE_KEY': string;
      'NET_ENV_CACHE_KEY': string;
      [name: string]: string | number | { [name: string]: any };
    }

    export interface Utils {
      getUserHomeDir(): string | null;
      getApiData(options: any): Promise<NetData>;
      checkNetStatus(testUrl: string, timeout?: number): Promise<boolean>;
      getFileNames(dir: fs.PathLike): string[];

    }

    export interface NetData {
      status: boolean;
      data: any;
      error?: any;
    }

    export type EnvType = 'intranet' | 'extranet';
  }

  // CORE的模块接口
  export namespace core {
    
    type Modules = {
      (name: 'container'): KitContainer;
      (name: 'config'): Config;
      (name: 'error'): ErrorHandles;
      (name: 'fs'): Fs;
      (name: 'home'): Home;
      (name: 'module'): Module;
      (name: 'npm'): Npm;
      (name: 'runtime'): Runtime;
      (name: 'setting'): Setting;
      (name: 'utils'): Utils;
      (name: 'helper'): string;
      (name: 'task'): (command:string, options?: any) => Promise<boolean>;
    }

    type Commands = {
      (this: Core, name: string): Promise<void>;
    }

    // CORE构造函数接口
    export interface Core extends Ufx {
      getBaseModule: any;
      getCoreModule: Modules
      getCoreCommand: Commands;
      coreInfo: any;
      baseLog: logFn
      kit: KitModules
    }

    export interface FormatArgv {
      cliArgs: any[];
      cliOpts: object;
    }

    export type ModuleType = 'KIT' | 'PLUGIN' | 'NORMAL';
    export interface Utils extends base.Utils {
      formatArgv(argv: any): FormatArgv;
      generateNames(str: string): string;
      isEmptyObject(e: Object): boolean;
      isDirectory(dir: fs.PathLike): boolean;
      isFile(file: fs.PathLike): boolean;
      isGeneratorFunction(obj: any): boolean;
      getIp(): string;
      getPkgName(name: string): string;
      getFullName(name: string): string;
      getKitName(name: string): string;
      getPluginName(name: string): string;
      getNpmSearchApi(name: string): string;
      getFrameworkKeyword(): string;
      checkModuleType(name: string): ModuleType;
      printInfo(list: ListItem[]): void;
      fixedWidth(str: string, width?: number, placeholder?: string): string
    }

    export type DirCopy = fs.DirCopy;

    export interface Fs extends fs.ufxFs { }

    export interface Config {
      exist(root?: string): boolean;
      get(key: string, root?: string): any;
      getAll(root?: string): any;
      getKitName( root?: string): string | null;
      setKitName(name: string): void;
    }

    export interface Home extends base.Home {
      getModulesPath(): string;
      getModulePkgPath(fullName: string): string;
      getModulePkgInfo(fullName: string): any;
      cleanModulesDir(): void;
    }

    export interface ufxModules {
      kit: ListItem[];
      mod: ListItem[]
    }
    export interface Module {
      checkModule(kitName: string): Promise<checkResult>;
      require(moduleName: string): Promise<any>;
      requirePkgInfo(moduleName: string): Promise<any>;
      requireModule(moduleName: string): Promise<any>;
      getModule(moduleName: string): Promise<any>;
      modLocalExist(name: string): Promise<boolean>;
      getLocalModuleList(): Promise<ListItem[]>;
      getOnlineModuleList(keyword?: string): Promise<ListItem[]>;
      getKitList(): Promise<ListItem[]>;
      getAllModules(): Promise<ufxModules>;
    }

    export interface Npm extends base.Npm {
      uninstall(pkg: string | any[], options?: object): Promise<any>;
      update(pkg: string | any[], options?: object): Promise<any>;
      installDependencies(options?: object): Promise<any>;
      installModules(pkg: string | any[], options?: any): Promise<any>;
      uninstallModules(pkg: string | any[], options?: any): Promise<any>;
      check(name: string, options?: any): Promise<boolean>;
    }

    export interface CoreTypeError extends TypeError {
      code?: string;
    }

    export type ErrorList = CoreTypeError[];

    export interface ErrorHandles {
      clearError(): Promise<void>;
      getErrorList(): core.ErrorList;
      checkRetry(): boolean;
      register(handle: CoreTypeError): void;
      noFoundHandle(err: CoreTypeError): Promise<boolean>;
      defaultHandle(err: CoreTypeError): Promise<boolean>;
    }

    export interface KitLog {
      logInfo(...content: any[]): void;
      logError(...content: any[]): void;
      logWarn(...content: any[]): void;
      logSuccess(...content: any[]): void;
      logDebug(...content: any[]): void;
    }

    export interface Runtime extends KitLog {
      nameSpace: string,
      require(moduleName: string): Promise<any>;
      requirePkg(moduleName: string): Promise<any>;
      tnpmInstall(options?: any, cb?: Function): Promise<any>;
      getUfeModule?(name: string, cb?: Function): Promise<any>;
      getUfeModulesPath?(): string;
      getModuleConfig(key: string): any;
      getModulesPath(): string;
      dirCopy(options: DirCopy): void;
      fileCopy(options: DirCopy): void;
      config: Config;
      chalk: Chalk,
      fs: fs.ufxFs | any;
      home: Home;
      npm: Npm;
      utils: Utils
      env: RuntimeEnv;
      log: logFn;
      inquirer?: any;
      clientArgs?: string[];
      clientOptions?: ufxObj<any>;
    }

    export interface Setting extends base.Setting {
      templateSettings: {
        [name: string]: RegExp
      };
      'CONFIG_FILE_NAME': string;
      'MODULE_UPDATE_PRE': string;
      'ONLINE_MODULE_CACHE_KEY': string;
    }

    export interface ListItem {
      name: string;
      description: string;
    }

    export interface KitContainer {
      init(): void;
      requireKitModule(modPath: string): Function;
      requireKit(kitName: string): KitContext;
      requireKitPkgInfo(kitName: string): any;
      setKitContext(ctx: core.Runtime): KitModules;
      context: KitContext
    }
  }

  export interface Runtime extends core.Runtime {
    kit: KitModules
  }
  
  export interface KitCommands {
    help(this: Runtime): void | Promise<void>;
    add?(this: Runtime): void | Promise<void>;
    init?(this: Runtime): void | Promise<void>;
    dev?(this: Runtime): void | Promise<void>;
    build?(this: Runtime): void | Promise<void>;
    test?(this: Runtime): void | Promise<void>;
    publish?(this: Runtime): void | Promise<void>;
    [name: string]: (this: Runtime) =>void | Promise<void>;
  }

  export interface KitModules {
    [name: string]: ufxObj<any>;
  }

  export interface KitContext {
    commands: KitCommands;
    modules?: KitModules;
    [name:string]: KitModules
  }
}
