import type { Compiler } from "webpack";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);
let executed = false;

/**
 * 递归创建目录
 * @param {string} dirPath 要创建的目录路径
 */
function mkdirp(dirPath: string) {
    if (fs.existsSync(dirPath)) {
        return; // 如果目录已存在，直接返回
    }
    const parentDir = path.dirname(dirPath); // 获取父目录
    if (!fs.existsSync(parentDir)) {
        mkdirp(parentDir); // 递归创建父目录
    }
    fs.mkdirSync(dirPath); // 创建当前目录
}

/**
 * 插件选项类型定义
 */
export type Option = {
    /**
     * 需要监听的目录路径
     */
    watchDir: string;

    /**
     * 输出声明文件的目录路径（默认为 watchDir）
     */
    distDir?: string;

    /**
     * 要监听的文件后缀名（如 ".ts"）
     */
    suffix: string;

    /**
     * 自定义生成声明文件内容的渲染函数
     */
    render?: (names: string[]) => string;
};

/**
 * Webpack 的 WatchFileSystem 类型，用于访问文件变动信息
 */
interface WatchFileSystem {
    watcher: { directoryWatchers: Map<string, object> };
}

/**
 * TypeNamesInFolderPlugin
 * 用于根据指定目录内的文件名生成 TypeScript 类型声明文件。
 */
class TypeNamesInFolderPlugin {
    private readonly watchDir: string; // 要监听的目录路径
    private readonly distDir: string; // 输出目录路径
    private readonly suffix: string; // 监听的文件后缀名
    private readonly render?: (names: string[]) => string; // 自定义渲染函数
    private cachedNames: Set<string>; // 缓存的文件名集合
    private readonly suffixName: string; // 去掉点号的后缀名（如 "ts"）

    /**
     * 构造函数
     * @param options 插件配置选项
     */
    constructor(options: Option) {
        const { watchDir, distDir, suffix, render } = options || {};
        if (!watchDir || !suffix) {
            throw new Error("`watchDir` and `suffix` options are required.");
        }
        this.watchDir = watchDir;
        this.distDir = distDir || watchDir;
        this.suffix = suffix;
        this.render = render;
        this.cachedNames = new Set(); // 使用 Set 提高对比效率
        this.suffixName = this.suffix.replace(".", "");
    }

    /**
     * 获取指定目录内的文件名（去除后缀）
     * @param dirPath 目标目录路径
     * @returns 返回去掉后缀的文件名数组
     */
    async getFileNames(dirPath: string) {
        try {
            const files: string[] = await fs.promises.readdir(dirPath);
            return files
                .filter((file) => file.endsWith(this.suffix))
                .map((file) => path.basename(file, this.suffix));
        } catch (err) {
            console.error(`[TypeNamesPlugin] Failed to read directory: ${dirPath}`);
            return [];
        }
    }

    /**
     * 检测文件名是否有变化
     * @param currentNames 当前获取的文件名数组
     * @returns 返回布尔值，表示是否有变化
     */
    hasFileNamesChanged(currentNames: string[]) {
        const currentSet = new Set(currentNames);
        if (currentSet.size !== this.cachedNames.size) {
            return true;
        }
        for (const name of Array.from(currentSet)) {
            if (!this.cachedNames.has(name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 生成声明文件内容
     * @param names 文件名数组
     * @returns 返回生成的声明文件内容
     */
    generateDeclarationContent(names: string[]) {
        const suffixName = this.suffixName;
        if (this.render) {
            return this.render(names);
        }
        const formattedNames =
            names.length < 5 ? names.join("|") : `\n  | ${names.join("\n  | ")}`;
        return `export declare type ${suffixName.toUpperCase()}Names =${formattedNames};\n`;
    }

    /**
     * Webpack 插件的主函数
     * @param compiler Webpack 编译器实例
     */
    async apply(compiler: Compiler) {
        compiler.hooks.watchRun.tapAsync("TypeNamesPlugin", async (_, callback) => {
            try {
                // 获取 Webpack 的目录监听器
                const directoryWatchers = (
                    compiler.watchFileSystem as unknown as WatchFileSystem
                )?.watcher.directoryWatchers;

                const dirPath = path.resolve(compiler.context, this.watchDir);
                const isWatchDirChanged = !!directoryWatchers.get(dirPath);

                // 如果监听的目录没有变动，且已执行过逻辑，跳过
                if (!isWatchDirChanged && executed) {
                    return callback();
                }

                if (!executed) {
                    executed = true;
                }

                const distPath = path.resolve(compiler.context, this.distDir);
                console.time("TypeNamesPlugin");
                const currentNames = await this.getFileNames(dirPath);
                console.timeEnd("TypeNamesPlugin");

                // 如果文件名没有变化，则跳过
                if (!this.hasFileNamesChanged(currentNames)) {
                    return callback();
                }

                const names = currentNames.map((n) => `"${n}"`);
                const declarationContent = this.generateDeclarationContent(names);

                // 确保输出目录存在
                mkdirp(distPath);

                // 写入声明文件
                const outputFile = path.join(
                    distPath,
                    `${this.suffixName.toLowerCase()}.d.ts`
                );
                await writeFileAsync(outputFile, declarationContent);

                // 更新缓存
                this.cachedNames = new Set(currentNames);

                console.log(
                    `\x1b[32m[TypeNamesPlugin] Updated declaration file: ${outputFile}\x1b[0m`
                );
                callback();
            } catch (err) {
                console.error(`[TypeNamesPlugin] Error:`, err);
                callback(err as Error);
            }
        });
    }
}

export default TypeNamesInFolderPlugin;
