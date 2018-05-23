import { Stylesheet, Generator, Resolver, Config } from '../index';

export declare type StylesheetWithContext = typeof Stylesheet & { context: StylableContext };
export declare type Pojo<T = {}> = { [key: string]: T };

export class StylableContext {
    static globalSheetCounter = 0;
    sheets: Stylesheet[] = [];
    style: any = null;
    public generator: Generator;
    public resolver: Resolver;
    private inMemoryModules: Pojo;
    constructor(config: Partial<Config>) { 
        this.inMemoryModules = {};
        this.resolver = new Resolver(this.inMemoryModules);
        this.generator = new Generator({...config, resolver: this.resolver});
    }
    add(sheet: Stylesheet) {
        (this.generator as any).config.resolver.zMap[sheet.namespace] = sheet;
        this.sheets.push(sheet);
    }
    registerMixin(name: string, mixin: Function) {
        this.inMemoryModules['Mixins/' + name] = mixin;
    }
    attach(theme?: Pojo<string>) {
        const style = this.style || (this.style = document.createElement('style'));
        Generator.generate(this.sheets, this.generator).forEach((css) => {
            style.appendChild(document.createTextNode(css));
        });
        document.head.appendChild(this.style);
    }
}

export function createStyleableStylesheet(config?: object): StylesheetWithContext {

    return class StylableStylesheet extends Stylesheet {
        static context = new StylableContext({ namespaceDivider: "▪" });
        _kind = "Stylesheet";
        get(name: string) {
            const n = this.classes[name];
            return n ? StylableStylesheet.context.generator.scope(name, this.namespace) : null;
        }
        constructor(public styleDef: any) {
            super(styleDef);
            this.namespace = 's' + (StylableContext.globalSheetCounter++);
            StylableStylesheet.context.add(this);
        }
    }
}
